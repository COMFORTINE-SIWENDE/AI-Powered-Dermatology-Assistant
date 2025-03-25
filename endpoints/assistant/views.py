from PIL import Image

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django_rest_passwordreset.views import ResetPasswordRequestToken, ResetPasswordConfirm
from .serializers import (
    UserSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer,
    SkinDiseasePredictionSerializer,
    ChatHistorySerializer,
)
from django.db.models import Q
from .models import User, SkinDiseasePrediction, ChatHistory,Dermatologist
import numpy as np
import tensorflow as tf
from rest_framework.views import APIView
import os
import uuid
from django.conf import settings

from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory,BaseChatMessageHistory
from langchain_openai import AzureChatOpenAI

# # Configure Azure OpenAI
api_key = settings.AZURE_OPENAI_API_KEY
api_endpoint = settings.AZURE_OPENAI_API_ENDPOINT
azure_search_api=settings.AZURE_AI_SEARCH_API
azure_search_endpoint = settings.AZURE_AI_SEARCH_ENDPOINT

from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential


llm = AzureChatOpenAI(
    openai_api_key=api_key,
    azure_endpoint=api_endpoint,
    api_version="2024-05-01-preview",
    model_name="gpt-35-turbo",
    temperature=0.7,
)

# Initialize chat history
chat_history = InMemoryChatMessageHistory()

# Define the function to retrieve session history
store={}
def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]
# Create a ConversationChain
conversation_chain = ConversationChain(
    llm=llm,
    memory=ConversationBufferMemory(),
)
# Initialize the conversation handler
conversation_handler = RunnableWithMessageHistory(
    runnable=conversation_chain,
    get_session_history=get_session_history,
    input_messages_key="input", 
    history_messages_key="history"  
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_serializer(self, *args, **kwargs):
        serializer = super().get_serializer(*args, **kwargs)
        print("Serializer:", serializer)  # Debugging line
        return serializer

class LoginView(TokenObtainPairView):
    pass  

class PasswordResetView(ResetPasswordRequestToken):
    serializer_class = PasswordResetSerializer

class PasswordResetConfirmView(ResetPasswordConfirm):
    serializer_class = PasswordResetConfirmSerializer

# Load the model
model_path = os.path.abspath(
    "/home/comphortine/Comphortine/Dermatology Assistant/endpoints/Skin_Disease_Classification.keras"
)
model = tf.keras.models.load_model(model_path)
# print(model.summary())
# print(f"Model file path: {os.path.abspath('model.h5')}")

# Disease categories
data_cat = [
    'acne', 'actinickeratosis', 'alopeciaareata', 'chickenpox', 'cold sores',
    'eczema', 'folliculitis', 'hives', 'impetigo', 'melanoma', 'psoriasis',
    'ringworm', 'rosacea', 'shingles', 'uticaria', 'vitiligo', 'warts'
]
# Autonomous ChatBot AI Agent
# Prompt chaining
def predict_disease(image):
    # Preprocess the image and predict the disease
    img_width, img_height = 180, 180
    pil_image = Image.open(image).convert("RGB")
    pil_image = pil_image.resize((img_width, img_height))
    image_arr = tf.keras.utils.array_to_img(pil_image)
    image_bat = tf.expand_dims(image_arr, axis=0)
    predict = model.predict(image_bat)
    score = tf.nn.softmax(predict)
    predicted_disease = data_cat[np.argmax(score)]
    confidence_score = float(np.max(score) * 100)
    return predicted_disease, confidence_score

def generate_chatbot_response(predicted_disease, confidence_score, symptoms, session_id):
    # Generate a chatbot response using LangChain
    prompt = f"I have {predicted_disease} with {confidence_score:.2f}% confidence. My symptoms are: {symptoms}. What should I do?"
    response = conversation_handler.invoke(
        {"input": prompt},
        config={"configurable": {"session_id": session_id}},
    )
    return response['response']
# from channels.db import database_sync_to_async
# @database_sync_to_async
def save_prediction(user_name, image, symptoms, predicted_disease, confidence_score, chatbot_response):
    # Save the prediction to the database
    prediction = SkinDiseasePrediction.objects.create(
        user_name=user_name,
        image=image,
        symptoms=symptoms,
        predicted_disease=predicted_disease,
        confidence_score=confidence_score,
        chatbot_response=chatbot_response,
    )
    return prediction

class SkinDiseasePredictionView(APIView):
    def post(self, request, *args, **kwargs):
        user_name = request.data.get('user_name')
        image = request.FILES.get('image')
        symptoms = request.data.get('symptoms')
        session_id = request.data.get('session_id', str(uuid.uuid4()))  # Generate a new session_id if not provided

        if not image or not symptoms:
            return Response(
                {"error": "Image and symptoms are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Step 1: Predict the disease
            predicted_disease, confidence_score =predict_disease(image)

            # Step 2: Generate chatbot response
            chatbot_response = generate_chatbot_response(predicted_disease, confidence_score, symptoms, session_id)

            # Step 3: Save the prediction
            prediction = SkinDiseasePrediction.objects.create(
                user_name=user_name,
                image=image,
                symptoms=symptoms,
                predicted_disease=predicted_disease,
                confidence_score=confidence_score,
                chatbot_response=chatbot_response,
            )

            # Serialize the response
            serializer = SkinDiseasePredictionSerializer(prediction)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# Routing
# Dermatology query function
def query_dermatologist(query):
    # Search for dermatologists by name or specialization
    dermatologists = Dermatologist.objects.filter(
        Q(name__icontains=query) | Q(specialization__icontains=query)
    )
    return dermatologists

def route_input(user_input, image=None):
    if image:
        return "cnn_model"
    elif "treatment" in user_input.lower():
        return "rag_retriever"
    elif "dermatologist" in user_input.lower():
        return "database_query"
    else:
        return "llm_chat"

def handle_database_query(query):
    dermatologists = query_dermatologist(query)
    if dermatologists:
        dermatologist_info = "\n".join([f"{d.name} ({d.email})" for d in dermatologists])
        return f"Here are some dermatologists:\n{dermatologist_info}"
    else:
        return "No dermatologists found."
search_client = SearchClient(
    endpoint=azure_search_endpoint,
    index_name="medical-knowledge",
    credential=AzureKeyCredential('azure_search_api'),
)
def retrieve_medical_info(query):
    results = search_client.search(search_text=query)
    return [result["content"] for result in results]
    
def handle_rag_retriever(query):
    medical_info = retrieve_medical_info(query)
    if medical_info:
        return f"Here is some medical information:\n" + "\n".join(medical_info)
    else:
        return "No relevant medical information found."
    # *********


def handle_input(user_input, image=None, session_id=None):
    task = route_input(user_input, image)

    if task == "cnn_model":
        # Handle image-based diagnosis
        predicted_disease, confidence_score = predict_disease(image)
        chatbot_response = generate_chatbot_response(predicted_disease, confidence_score, "", session_id)
    elif task == "rag_retriever":
        # Handle treatment-related queries
        chatbot_response = handle_rag_retriever(user_input)
    elif task == "database_query":
        # Handle dermatologist-related queries
        chatbot_response = handle_database_query(user_input)
    else:
        # Handle general chat
        response = conversation_handler.invoke(
            {"input": user_input},
            config={"configurable": {"session_id": session_id}},
        )
        chatbot_response = response['response']

    return chatbot_response

def process_user_query(user_message, session_id):
    response = conversation_handler.invoke(
        {"input": user_message},
        config={"configurable": {"session_id": session_id}},
    )
    return response['response']
def screen_content(user_message):
    # Add actual content moderation logic here
    return True

def handle_user_query(user_message, session_id):
    response = process_user_query(user_message, session_id)
    is_appropriate = screen_content(user_message)
    return response if is_appropriate else "Content blocked"

class ChatbotView(APIView):
    def post(self, request, *args, **kwargs):
        user_message = request.data.get('message')
        user_id = request.data.get('user_id', str(uuid.uuid4()))
        image = request.FILES.get('image')

        if not user_message and not image:
            return Response(
                {"error": "Message or image is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            chatbot_response = handle_input(user_message, image, user_id)
            chat = ChatHistory.objects.create(
                user_id=user_id,
                user_message=user_message,
                chatbot_response=chatbot_response,
            )
            return Response(ChatHistorySerializer(chat).data, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
           
# parallelization    
# Retrieval-Augment-Generation


# Initialize Azure Cognitive Search client

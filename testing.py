class SkinDiseasePredictionView(APIView):
    def post(self, request, *args, **kwargs):
        user_name = request.data.get('user_name')
        image = request.FILES.get('image')
        symptoms = request.data.get('symptoms')
        session_id = request.data.get('session_id')

        if not image or not symptoms:
            return Response(
                {"error": "Image and symptoms are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not session_id:
            # Generate a new session_id if not provided
            session_id = str(uuid.uuid4())

        try:
             # Convert InMemoryUploadedFile to a PIL Image
            img_width, img_height = 180, 180
            pil_image = Image.open(image).convert("RGB")
            pil_image = pil_image.resize((img_width, img_height))
            image_arr = tf.keras.utils.array_to_img(pil_image)
            image_bat = tf.expand_dims(image_arr, axis=0)
            print(f"Image shape: {image_bat.shape}")


            predict = model.predict(image_bat)
            score = tf.nn.softmax(predict)
            predicted_disease = data_cat[np.argmax(score)]
            confidence_score = float(np.max(score) * 100)
            print(f"PREDICTED {predicted_disease}")

            # Generate a chatbot response using LangChain
            prompt = f"I have {predicted_disease} with {confidence_score:.2f}% confidence. My symptoms are: {symptoms}. What should I do?"
            response = conversation_handler.invoke({"input":prompt},config={"configurable":{"session_id":session_id}})
            chatbot_response = response['response']

            # Convert the PIL image back to an InMemoryUploadedFile
            image_io = io.BytesIO()
            pil_image.save(image_io, format='JPEG')
            image_file = InMemoryUploadedFile(
                image_io, None, image.name, 'image/jpeg', image_io.tell, None
            )

            # Save the data to the database
            prediction = SkinDiseasePrediction.objects.create(
                user_name=user_name,
                image=image_file,
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

class ChatbotView(APIView):
    def post(self, request, *args, **kwargs):
        user_message = request.data.get('message')
        user_id = request.data.get('user_id')  # Optional: Identify the user

        if not user_message:
            return Response(
                {"error": "Message is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Generate a response using LangChain
            response = conversation_handler.invoke({"input":user_message},config={"configurable": {"session_id": user_id}},)
            chatbot_response = response['response']

            # Save the conversation to the database
            chat = ChatHistory.objects.create(
                user_id=user_id,
                user_message=user_message,
                chatbot_response=chatbot_response,
            )

            # Serialize the response
            serializer = ChatHistorySerializer(chat)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

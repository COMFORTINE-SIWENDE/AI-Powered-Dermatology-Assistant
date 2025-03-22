from rest_framework import serializers
# from django.contrib.auth.models import User 
from django_rest_passwordreset.models import ResetPasswordToken
from .models import SkinDiseasePrediction,ChatHistory
from django.contrib.auth import get_user_model


User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField()


class SkinDiseasePredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkinDiseasePrediction
        # removed user_name field
        fields = ['id','image', 'symptoms', 'predicted_disease', 'confidence_score', 'chatbot_response', 'created_at']
    
class ChatHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatHistory
        fields = ['id', 'user_id', 'user_message', 'chatbot_response', 'created_at']
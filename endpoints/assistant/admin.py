from django.contrib import admin
from .models import User,ChatHistory,SkinDiseasePrediction,ConversationSession,Dermatologist
admin.site.register(User)

admin.site.register(ChatHistory)
admin.site.register(SkinDiseasePrediction)
admin.site.register(ConversationSession)
admin.site.register(Dermatologist)

admin.site.site_header = "Dermatology Assistant Admin"
admin.site.site_title = "Assistant Portal"
admin.site.index_title = "Welcome to AI-Dermatology Assistant"

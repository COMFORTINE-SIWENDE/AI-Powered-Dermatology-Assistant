import os

from django.core.asgi import get_asgi_application

os.getenv.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')

application = get_asgi_application()

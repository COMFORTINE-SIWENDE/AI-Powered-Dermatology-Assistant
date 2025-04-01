import os
from .settings import *
from .settings import BASE_DIR


# original
# ALLOWED_HOSTS = [os.environ['WEBSITE_HOSTNAME']]
# CSRF_TRUSTED_ORIGINS = ['https://'+os.environ['WEBSITE_HOSTNAME']]
# DEBUG = False
# # SECRET_KEY=os.environ['MY_SECRET_KEY']

# original end


WEBSITE_HOSTNAME = os.getenv("WEBSITE_HOSTNAME")  # Returns None if missing
SECRET_KEY = os.getenv("MY_SECRET_KEY")  # Returns None if missing

# Validate required variables
if not WEBSITE_HOSTNAME:
    raise ValueError("WEBSITE_HOSTNAME environment variable is missing! Check Azure App Settings.")
if not SECRET_KEY:
    raise ValueError("MY_SECRET_KEY environment variable is missing! Check Azure App Settings.")

ALLOWED_HOSTS = [WEBSITE_HOSTNAME]
CSRF_TRUSTED_ORIGINS = [f'https://{WEBSITE_HOSTNAME}']
DEBUG = False

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS_ALLOWED_ORIGINS = []


STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

CONNECTION = os.environ['AZURE_POSTGRESQL_CONNECTIONSTRING']
CONNECTION_STR = {pair.split('=')[0]:pair.split('=')[1] for pair in CONNECTION.split(' ')}

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": CONNECTION_STR['dbname'],
        "HOST": CONNECTION_STR['host'],
        "USER": CONNECTION_STR['user'],
        "PASSWORD": CONNECTION_STR['password'],
    }
}





STATIC_ROOT = BASE_DIR/'staticfiles'
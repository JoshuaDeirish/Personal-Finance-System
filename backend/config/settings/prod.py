import dj_database_url
from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F401,F403
from .base import SECRET_KEY, env, env_bool

DEBUG = False

if not SECRET_KEY:
    raise ImproperlyConfigured("SECRET_KEY must be set in production.")
if not env("DATABASE_URL"):
    raise ImproperlyConfigured("DATABASE_URL must be set in production.")

DATABASES = {
    "default": dj_database_url.config(
        env="DATABASE_URL", conn_max_age=600, conn_health_checks=True
    )
}

# Railway terminates TLS at its proxy.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", True)
SECURE_REDIRECT_EXEMPT = [r"^api/health/$"]  # platform health checks use plain HTTP
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = int(env("SECURE_HSTS_SECONDS", "31536000"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

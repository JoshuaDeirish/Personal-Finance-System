"""
Settings shared by every environment.

All environment-specific values come from environment variables. For local
development, variables may also be placed in backend/.env (never committed).
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def _load_env_file(path):
    """Minimal .env loader so local development needs no extra dependency.
    Real environment variables always win over the file."""
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_env_file(BASE_DIR / ".env")


def env(name, default=None):
    """Read an environment variable; empty values count as unset."""
    value = os.environ.get(name)
    return default if value in (None, "") else value


def env_bool(name, default=False):
    return env(name, str(default)).lower() in ("1", "true", "yes", "on")


def env_list(name, default=""):
    return [item.strip() for item in env(name, default).split(",") if item.strip()]


SECRET_KEY = env("SECRET_KEY")
DEBUG = False
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "django_filters",
    "corsheaders",
    "apps.core",
    "apps.users",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- Authentication -------------------------------------------------------
# Django's built-in session auth. The frontend is served from the same origin
# as the API (Vite proxy in development, Vercel rewrite in production), so the
# session cookie is first-party and can stay httpOnly + SameSite=Lax.
AUTH_USER_MODEL = "users.User"
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
     "OPTIONS": {"min_length": 10}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

SESSION_COOKIE_AGE = 60 * 60 * 24 * 30  # 30 days for "remember me" logins
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_HTTPONLY = False  # the SPA must read csrftoken to send X-CSRFToken
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS")

# Public sign-up is off by default: this is a personal app.
ALLOW_REGISTRATION = env_bool("ALLOW_REGISTRATION", False)

# --- CORS (fallback only; normal traffic is same-origin) -------------------
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_CREDENTIALS = True

# --- Django REST Framework ------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["apps.users.authentication.SessionAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    # Money leaves the API as strings so the browser never holds floats.
    "COERCE_DECIMAL_TO_STRING": True,
    "DEFAULT_THROTTLE_RATES": {"auth": "10/min"},
}

# --- Money -----------------------------------------------------------------
# Single currency for V1. Stored per user so multi-currency can be added later.
DEFAULT_CURRENCY = "CAD"

# --- Internationalisation -------------------------------------------------
LANGUAGE_CODE = "en-ca"
TIME_ZONE = "America/Toronto"
USE_I18N = True
USE_TZ = True

# --- Static files ---------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": env("LOG_LEVEL", "INFO")},
}

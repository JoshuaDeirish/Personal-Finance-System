import dj_database_url

from .base import *  # noqa: F401,F403
from .base import env, env_bool, env_list

DEBUG = True
SECRET_KEY = env("SECRET_KEY", "dev-insecure-secret-key-change-me")
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1,[::1]")

DATABASES = {
    "default": dj_database_url.config(
        env="DATABASE_URL",
        default="postgres://localhost:5432/finance_dev",
        conn_max_age=0,
    )
}

# The Vite dev server proxies /api to Django, so the browser origin is :5173.
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", "http://localhost:5173")
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
ALLOW_REGISTRATION = env_bool("ALLOW_REGISTRATION", True)

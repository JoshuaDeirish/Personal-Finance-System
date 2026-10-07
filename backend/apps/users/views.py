"""
Session-based authentication endpoints (Django's built-in auth).

Flow for the SPA:
  1. GET  /api/auth/csrf/   -> sets the `csrftoken` cookie.
  2. POST /api/auth/login/  -> sends X-CSRFToken; on success Django sets the
                               httpOnly session cookie and rotates csrftoken.
  3. Every later unsafe request sends X-CSRFToken (enforced by DRF).
  4. POST /api/auth/logout/ -> flushes the server-side session.

Login and register are called while logged out, which is when DRF skips its
CSRF check, so those views enforce CSRF explicitly to prevent login CSRF.
"""
from django.conf import settings
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .authentication import SessionAuthentication
from .serializers import (
    LoginSerializer,
    PasswordChangeSerializer,
    RegisterSerializer,
    UserSerializer,
)


def _enforce_csrf(request):
    SessionAuthentication().enforce_csrf(request)


def _start_session(request, user, remember):
    login(request, user)
    if not remember:
        request.session.set_expiry(0)  # expire when the browser closes


class CsrfView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return Response({"detail": "CSRF cookie set."})


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        _enforce_csrf(request)
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = authenticate(request, email=data["email"], password=data["password"])
        if user is None:
            return Response(
                {"detail": "Incorrect email or password."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        _start_session(request, user, data["remember"])
        return Response(UserSerializer(user).data)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        if not settings.ALLOW_REGISTRATION:
            raise NotFound()
        _enforce_csrf(request)
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        _start_session(request, user, remember=True)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PasswordChangeView(APIView):
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        update_session_auth_hash(request, request.user)  # keep this session, end others
        return Response(status=status.HTTP_204_NO_CONTENT)

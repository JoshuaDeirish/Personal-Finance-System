import re
import zoneinfo

from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import User, normalize_email_address


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "date_of_birth",
            "currency", "timezone", "safety_buffer", "created_at",
        ]
        read_only_fields = ["id", "email", "created_at"]

    def validate_currency(self, value):
        value = value.upper()
        if not re.fullmatch(r"[A-Z]{3}", value):
            raise serializers.ValidationError("Use a 3-letter ISO currency code, e.g. CAD.")
        return value

    def validate_timezone(self, value):
        if value not in zoneinfo.available_timezones():
            raise serializers.ValidationError("Unknown time zone.")
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(trim_whitespace=False)
    remember = serializers.BooleanField(default=True)

    def validate_email(self, value):
        return normalize_email_address(value)


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(trim_whitespace=False, write_only=True)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_email(self, value):
        value = normalize_email_address(value)
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, attrs):
        candidate = User(
            email=attrs["email"],
            first_name=attrs.get("first_name", ""),
            last_name=attrs.get("last_name", ""),
        )
        try:
            password_validation.validate_password(attrs["password"], user=candidate)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(trim_whitespace=False)
    new_password = serializers.CharField(trim_whitespace=False)

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        password_validation.validate_password(value, user=self.context["request"].user)
        return value

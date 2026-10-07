from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models.functions import Lower
from django.utils import timezone as dj_timezone

from apps.core.money import ZERO, MoneyField


def normalize_email_address(email):
    """Emails are the login identifier, so compare them case-insensitively."""
    return (email or "").strip().lower()


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("An email address is required.")
        user = self.model(email=normalize_email_address(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if not extra_fields["is_staff"] or not extra_fields["is_superuser"]:
            raise ValueError("Superuser must have is_staff=True and is_superuser=True.")
        return self._create_user(email, password, **extra_fields)

    def get_by_natural_key(self, email):
        return self.get(email=normalize_email_address(email))


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)

    # Planning preferences used by the financial engine.
    date_of_birth = models.DateField(null=True, blank=True)
    currency = models.CharField(max_length=3, default=settings.DEFAULT_CURRENCY)
    timezone = models.CharField(max_length=64, default=settings.TIME_ZONE)
    safety_buffer = MoneyField(
        default=ZERO,
        validators=[MinValueValidator(ZERO)],
        help_text="Cash cushion that Safe to Spend always keeps aside.",
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=dj_timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        constraints = [
            models.UniqueConstraint(Lower("email"), name="users_user_email_ci_unique"),
            models.CheckConstraint(
                condition=models.Q(safety_buffer__gte=0), name="users_user_safety_buffer_gte_0"
            ),
        ]

    def __str__(self):
        return self.email

    def clean(self):
        super().clean()
        self.email = normalize_email_address(self.email)

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def get_short_name(self):
        return self.first_name

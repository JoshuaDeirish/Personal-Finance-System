from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["email"]
    list_display = ["email", "first_name", "last_name", "is_staff", "is_active", "created_at"]
    search_fields = ["email", "first_name", "last_name"]
    readonly_fields = ["created_at", "updated_at", "last_login"]
    fieldsets = [
        (None, {"fields": ["email", "password"]}),
        ("Personal", {"fields": ["first_name", "last_name", "date_of_birth"]}),
        ("Preferences", {"fields": ["currency", "timezone", "safety_buffer"]}),
        ("Permissions", {"fields": ["is_active", "is_staff", "is_superuser", "groups", "user_permissions"]}),
        ("Dates", {"fields": ["last_login", "created_at", "updated_at"]}),
    ]
    add_fieldsets = [
        (None, {"classes": ["wide"], "fields": ["email", "password1", "password2"]}),
    ]

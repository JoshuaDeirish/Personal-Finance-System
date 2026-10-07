from django.core.cache import cache
from django.db import IntegrityError
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import User

PASSWORD = "correct-horse-battery-9"


class AuthTestCase(TestCase):
    def setUp(self):
        cache.clear()  # reset login throttling between tests
        self.user = User.objects.create_user(email="me@example.com", password=PASSWORD)
        self.client = APIClient(enforce_csrf_checks=True)

    def csrf(self):
        """Mimic the SPA: fetch the CSRF cookie, return the header to send."""
        self.client.get("/api/auth/csrf/")
        return {"HTTP_X_CSRFTOKEN": self.client.cookies["csrftoken"].value}

    def login(self, email="me@example.com", password=PASSWORD, **extra):
        return self.client.post(
            "/api/auth/login/",
            {"email": email, "password": password, **extra},
            format="json",
            **self.csrf(),
        )


class LoginTests(AuthTestCase):
    def test_csrf_endpoint_sets_cookie(self):
        response = self.client.get("/api/auth/csrf/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("csrftoken", response.cookies)

    def test_login_requires_csrf_token(self):
        response = self.client.post(
            "/api/auth/login/", {"email": "me@example.com", "password": PASSWORD}, format="json"
        )
        self.assertEqual(response.status_code, 403)
        self.assertNotIn("sessionid", self.client.cookies)

    def test_login_sets_httponly_session_cookie_and_returns_user(self):
        response = self.login()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["email"], "me@example.com")
        self.assertNotIn("password", response.json())
        session_cookie = response.cookies["sessionid"]
        self.assertTrue(session_cookie["httponly"])
        self.assertEqual(session_cookie["samesite"], "Lax")

    def test_login_email_is_case_insensitive(self):
        self.assertEqual(self.login(email="  ME@Example.COM ").status_code, 200)

    def test_wrong_password_is_rejected_generically(self):
        response = self.login(password="wrong-password")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Incorrect email or password.")

    def test_unknown_email_gets_same_message(self):
        response = self.login(email="nobody@example.com")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Incorrect email or password.")

    def test_inactive_user_cannot_log_in(self):
        self.user.is_active = False
        self.user.save()
        self.assertEqual(self.login().status_code, 400)

    def test_remember_false_expires_at_browser_close(self):
        self.login(remember=False)
        self.assertTrue(self.client.session.get_expire_at_browser_close())

    def test_remember_default_keeps_session(self):
        self.login()
        self.assertFalse(self.client.session.get_expire_at_browser_close())

    def test_login_is_throttled(self):
        for _ in range(10):
            self.login(password="wrong-password")
        self.assertEqual(self.login().status_code, 429)


class SessionTests(AuthTestCase):
    def test_me_requires_authentication_with_401(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, 401)

    def test_me_returns_profile_after_login(self):
        self.login()
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["currency"], "CAD")
        self.assertEqual(response.json()["safety_buffer"], "0.00")  # money as string

    def test_unsafe_request_without_csrf_is_rejected_when_logged_in(self):
        self.login()
        response = self.client.patch("/api/auth/me/", {"first_name": "J"}, format="json")
        self.assertEqual(response.status_code, 403)

    def test_profile_update_with_csrf(self):
        self.login()
        response = self.client.patch(
            "/api/auth/me/",
            {"first_name": "Josh", "safety_buffer": "150.00", "currency": "cad"},
            format="json",
            **self.csrf(),
        )
        self.assertEqual(response.status_code, 200, response.content)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Josh")
        self.assertEqual(str(self.user.safety_buffer), "150.00")
        self.assertEqual(self.user.currency, "CAD")

    def test_profile_rejects_invalid_values(self):
        self.login()
        for payload in [
            {"timezone": "Mars/Olympus"},
            {"safety_buffer": "-5"},
            {"safety_buffer": "abc"},
            {"currency": "DOLLARS"},
        ]:
            with self.subTest(payload=payload):
                response = self.client.patch("/api/auth/me/", payload, format="json", **self.csrf())
                self.assertEqual(response.status_code, 400)

    def test_email_cannot_be_changed_through_profile(self):
        self.login()
        self.client.patch("/api/auth/me/", {"email": "x@example.com"}, format="json", **self.csrf())
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "me@example.com")

    def test_logout_ends_session(self):
        self.login()
        response = self.client.post("/api/auth/logout/", **self.csrf())
        self.assertEqual(response.status_code, 204)
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)

    def test_logout_requires_csrf(self):
        self.login()
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 403)
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 200)

    def test_password_change_keeps_current_session(self):
        self.login()
        response = self.client.post(
            "/api/auth/password/",
            {"current_password": PASSWORD, "new_password": "another-strong-pass-42"},
            format="json",
            **self.csrf(),
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("another-strong-pass-42"))

    def test_password_change_requires_current_password(self):
        self.login()
        response = self.client.post(
            "/api/auth/password/",
            {"current_password": "nope", "new_password": "another-strong-pass-42"},
            format="json",
            **self.csrf(),
        )
        self.assertEqual(response.status_code, 400)


class RegistrationTests(AuthTestCase):
    def register(self, **data):
        payload = {"email": "new@example.com", "password": "a-strong-password-1", **data}
        return self.client.post("/api/auth/register/", payload, format="json", **self.csrf())

    @override_settings(ALLOW_REGISTRATION=False)
    def test_registration_can_be_disabled(self):
        self.assertEqual(self.register().status_code, 404)

    @override_settings(ALLOW_REGISTRATION=True)
    def test_registration_creates_user_and_logs_in(self):
        response = self.register(first_name="New")
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(self.client.get("/api/auth/me/").json()["email"], "new@example.com")

    @override_settings(ALLOW_REGISTRATION=True)
    def test_duplicate_email_is_rejected_case_insensitively(self):
        response = self.register(email="ME@example.com")
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json())

    @override_settings(ALLOW_REGISTRATION=True)
    def test_weak_password_is_rejected(self):
        response = self.register(password="12345678")
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.json())


class UserModelTests(TestCase):
    def test_email_is_normalized_to_lowercase(self):
        user = User.objects.create_user(email="  Mixed@Example.COM", password=PASSWORD)
        self.assertEqual(user.email, "mixed@example.com")

    def test_case_insensitive_uniqueness_enforced_by_database(self):
        User.objects.create_user(email="dup@example.com", password=PASSWORD)
        with self.assertRaises(IntegrityError):
            User.objects.create(email="DUP@example.com")

    def test_create_superuser(self):
        admin = User.objects.create_superuser(email="admin@example.com", password=PASSWORD)
        self.assertTrue(admin.is_staff and admin.is_superuser)

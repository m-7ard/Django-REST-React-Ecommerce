from django.test import TestCase
from rest_framework.test import APITestCase


from .models import CustomUser


class UserTest(APITestCase):
    user_data = {
        "email": "test_user@mail.com",
        "password": "userword",
        "display_name": "test_user",
        "account_type": "individual",
    }


class UserRegistrationTest(UserTest):
    def test_register_user_success(self):
        response = self.client.post("/api/register/", self.user_data)
        self.assertEqual(
            response.status_code, 201, f"Failed to register user. {response.data}"
        )

    def test_register_duplicate_user_failure(self):
        CustomUser.objects.create_user(**self.user_data)
        response = self.client.post("/api/register/", self.user_data)
        self.assertEqual(
            response.status_code, 400, "Registration should fail for duplicate user."
        )


class UserLoginTest(UserTest):
    def setUp(self):
        CustomUser.objects.create_user(**self.user_data)

    def test_login_user_success(self):
        response = self.client.post("/api/login/", self.user_data)
        self.assertEqual(response.status_code, 200, "Failed to login user.")

    def test_login_invalid_credentials_failure(self):
        invalid_credentials = {
            "email": "test_user@mail.com",
            "password": "incorrect_password",
        }
        response = self.client.post("/api/login/", invalid_credentials)
        self.assertEqual(
            response.status_code, 400, "Login should fail for invalid credentials."
        )


class UserRequestTest(UserTest):
    def setUp(self):
        self.client.post("/api/register/", self.user_data)
        self.client.post("/api/login/", self.user_data)

    def test_get_user_data_success(self):
        response = self.client.get("/api/user/")
        self.assertEqual(response.status_code, 200, "Failed to get user data.")
        self.assertEqual(
            response.data["email"], self.user_data["email"], "Incorrect user data."
        )


class UserLogoutTest(UserTest):
    def setUp(self):
        self.client.post("/api/register/", self.user_data)
        self.client.post("/api/login/", self.user_data)

    def test_logout_user_success(self):
        response = self.client.post("/api/logout/")
        self.assertEqual(response.status_code, 200, "Failed to logout user.")

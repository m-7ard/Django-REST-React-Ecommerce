from django.test import TestCase
from rest_framework.test import APITestCase


from .models import CustomUser, Address, BankAccount
from .serializers import BankAccountSerializer, AddressSerializer


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


class BankAccountViewSet(APITestCase):
    def create_bank_accounts(self):
        self.test_user_bank = BankAccount.objects.create(
            user=self.test_user,
            owner="John Doe",
            address=self.address,
            iban="DE99123412341234120000",
        )
        self.other_user_bank = BankAccount.objects.create(
            user=self.other_user,
            owner="John Doe II",
            address=self.address,
            iban="DE99123412341234120001",
        )

    def setUp(self):
        self.test_user = CustomUser.objects.create_user(
            email="test_user@mail.com",
            password="userword",
            display_name="test_user",
            account_type="individual",
        )
        self.client.login(
            email="test_user@mail.com",
            password="userword",
        )
        self.address = Address.objects.create(
            user=self.test_user,
            name="John Doe",
            street="Main Street 123abc",
            zip_code="12345",
            country="Country",
        )
        self.other_user = CustomUser.objects.create_user(
            email="other_user@mail.com",
            password="userword",
            display_name="other_user",
            account_type="individual",
        )

    def test_bank_account_creation(self):
        response = self.client.post(
            "/api/bank-accounts/",
            {
                "owner": "John Doe",
                "address": self.address.pk,
                "iban": "DE99123412341234123412",
            },
        )
        self.assertEqual(response.status_code, 201, response.data)

    def test_list_bank_accounts(self):
        self.create_bank_accounts()
        response = self.client.get("/api/bank-accounts/")
        self.assertEqual(response.status_code, 200, "Failed to list bank accounts.")
        self.assertEqual(
            BankAccountSerializer([self.test_user_bank], many=True).data,
            response.data,
            "Data does not match. BankAccountViewset list must only return the request user BankAccounts.",
        )

    def test_retrieve_bank_account(self):
        self.create_bank_accounts()
        response_1 = self.client.get(f"/api/bank-accounts/{self.test_user_bank.pk}/")
        response_2 = self.client.get(f"/api/bank-accounts/{self.other_user_bank.pk}/")
        self.assertEqual(
            response_1.status_code, 200, "Failed to retrieve test user bank account."
        )
        self.assertEqual(
            response_2.status_code,
            404,
            "Users must only be allowed to retrieve their own bank accounts.",
        )

    def test_update_bank_account(self):
        self.create_bank_accounts()
        response_1 = self.client.patch(
            f"/api/bank-accounts/{self.test_user_bank.pk}/", {"owner": "Jane Doe"}
        )
        response_2 = self.client.patch(
            f"/api/bank-accounts/{self.other_user_bank.pk}/", {"owner": "Jane Doe"}
        )
        self.test_user_bank.refresh_from_db()
        self.other_user_bank.refresh_from_db()
        self.assertEqual(
            response_1.status_code, 200, "Failed to update test user bank account."
        )
        self.assertEqual(
            self.test_user_bank.owner,
            "Jane Doe",
            "Failed to update owner field of test user bank account.",
        )
        self.assertEqual(
            response_2.status_code,
            404,
            "Users must only be allowed to update their own bank accounts.",
        )
        self.assertEqual(
            self.other_user_bank.owner,
            "John Doe II",
            "Users must not be able to edit other user's bank accounts",
        )

    def test_delete_bank_account(self):
        self.create_bank_accounts()
        response_1 = self.client.delete(
            f"/api/bank-accounts/{self.test_user_bank.pk}/"
        )
        response_2 = self.client.delete(
            f"/api/bank-accounts/{self.other_user_bank.pk}/"
        )
        self.assertEqual(
            response_1.status_code, 204, "Failed to delete test user bank account."
        )
        self.assertFalse(
            BankAccount.objects.filter(pk=self.test_user_bank.pk).exists(),
            "Failed to delete test user bank account.",
        )
        self.assertEqual(
            response_2.status_code,
            404,
            "Users must only be allowed to delete their own bank accounts.",
        )
        self.assertTrue(
            BankAccount.objects.filter(pk=self.other_user_bank.pk).exists(),
            "Users must not be able to edit other user's bank accounts",
        )


class BankAccountViewSet(APITestCase):
    def create_bank_accounts(self):
        self.test_user_bank = BankAccount.objects.create(
            user=self.test_user,
            owner="John Doe",
            address=self.address,
            iban="DE99123412341234120000",
        )
        self.other_user_bank = BankAccount.objects.create(
            user=self.other_user,
            owner="John Doe II",
            address=self.address,
            iban="DE99123412341234120001",
        )

    def setUp(self):
        self.test_user = CustomUser.objects.create_user(
            email="test_user@mail.com",
            password="userword",
            display_name="test_user",
            account_type="individual",
        )
        self.client.login(
            email="test_user@mail.com",
            password="userword",
        )
        self.address = Address.objects.create(
            user=self.test_user,
            name="John Doe",
            street="Main Street 123abc",
            zip_code="12345",
            country="Country",
        )
        self.other_user = CustomUser.objects.create_user(
            email="other_user@mail.com",
            password="userword",
            display_name="other_user",
            account_type="individual",
        )

    def test_bank_account_creation(self):
        response = self.client.post(
            "/api/bank-accounts/",
            {
                "owner": "John Doe",
                "address": self.address.pk,
                "iban": "DE99123412341234123412",
            },
        )
        self.assertEqual(response.status_code, 201, "Failed to create bank account.")

    def test_list_bank_accounts(self):
        self.create_bank_accounts()
        response = self.client.get("/api/bank-accounts/")
        self.assertEqual(response.status_code, 200, "Failed to list bank accounts.")
        self.assertEqual(
            BankAccountSerializer([self.test_user_bank], many=True).data,
            response.data,
            "Data does not match. BankAccountViewset list must only return the request user BankAccounts.",
        )

    def test_retrieve_bank_account(self):
        self.create_bank_accounts()
        response_1 = self.client.get(f"/api/bank-accounts/{self.test_user_bank.pk}/")
        response_2 = self.client.get(f"/api/bank-accounts/{self.other_user_bank.pk}/")
        self.assertEqual(
            response_1.status_code, 200, "Failed to retrieve test user bank account."
        )
        self.assertEqual(
            response_2.status_code,
            404,
            "Users must only be allowed to retrieve their own bank accounts.",
        )

    def test_update_bank_account(self):
        self.create_bank_accounts()
        response_1 = self.client.patch(
            f"/api/bank-accounts/{self.test_user_bank.pk}/", {"owner": "Jane Doe"}
        )
        response_2 = self.client.patch(
            f"/api/bank-accounts/{self.other_user_bank.pk}/", {"owner": "Jane Doe"}
        )
        self.test_user_bank.refresh_from_db()
        self.other_user_bank.refresh_from_db()
        self.assertEqual(
            response_1.status_code, 200, "Failed to update test user bank account."
        )
        self.assertEqual(
            self.test_user_bank.owner,
            "Jane Doe",
            "Failed to update owner field of test user bank account.",
        )
        self.assertEqual(
            response_2.status_code,
            404,
            "Users must only be allowed to update their own bank accounts.",
        )
        self.assertEqual(
            self.other_user_bank.owner,
            "John Doe II",
            "Users must not be able to edit other user's bank accounts",
        )

    def test_delete_bank_account(self):
        self.create_bank_accounts()
        response_1 = self.client.delete(
            f"/api/bank-accounts/{self.test_user_bank.pk}/"
        )
        response_2 = self.client.delete(
            f"/api/bank-accounts/{self.other_user_bank.pk}/"
        )
        self.assertEqual(
            response_1.status_code, 204, "Failed to delete test user bank account."
        )
        self.assertFalse(
            BankAccount.objects.filter(pk=self.test_user_bank.pk).exists(),
            "Failed to delete test user bank account.",
        )
        self.assertEqual(
            response_2.status_code,
            404,
            "Users must only be allowed to delete their own bank accounts.",
        )
        self.assertTrue(
            BankAccount.objects.filter(pk=self.other_user_bank.pk).exists(),
            "Users must not be able to edit other user's bank accounts",
        )


class AddressViewSet(APITestCase):
    def create_addresses(self):
        self.test_user_address = Address.objects.create(
            user=self.test_user,
            **self.test_user_address_data
        )
        self.other_user_address = Address.objects.create(
            user=self.other_user,
            **self.other_user_address_data
        )

    def setUp(self):
        self.test_user = CustomUser.objects.create_user(
            email="test_user@mail.com",
            password="userword",
            display_name="test_user",
            account_type="individual",
        )
        self.client.login(
            email="test_user@mail.com",
            password="userword",
        )
        self.other_user = CustomUser.objects.create_user(
            email="other_user@mail.com",
            password="userword",
            display_name="other_user",
            account_type="individual",
        )
        self.test_user_address_data = {
            "name": "John Doe",
            "street": "Main Street 123abc",
            "zip_code": "12345",
            'locality': 'some town',
            "country": "AU",
        }
        self.other_user_address_data = {
            "name": "Mr. Hank",
            "street": "Second Street 2c",
            "zip_code": "55556",
            'locality': 'big city',
            "country": "BS",
        }

    def test_address_creation(self):
        response = self.client.post(
            "/api/addresses/",
            self.test_user_address_data
        )
        self.assertEqual(response.status_code, 201, "Failed to create address.")

    def test_list_addresses(self):
        self.create_addresses()
        response = self.client.get("/api/addresses/")
        self.assertEqual(response.status_code, 200, "Failed to list addresses.")
        self.assertEqual(
            AddressSerializer([self.test_user_address], many=True).data,
            response.data,
            "Data does not match. AddressViewset list must only return the request user Addresses.",
        )

    def test_retrieve_addresses(self):
        self.create_addresses()
        response_1 = self.client.get(f"/api/addresses/{self.test_user_address.pk}/")
        response_2 = self.client.get(f"/api/addresses/{self.other_user_address.pk}/")
        self.assertEqual(
            response_1.status_code, 200, "Failed to retrieve test user address."
        )
        self.assertEqual(
            response_2.status_code,
            404,
            "Users must only be allowed to retrieve their own addresses.",
        )

    def test_update_address(self):
        self.create_addresses()
        response_1 = self.client.patch(
            f"/api/addresses/{self.test_user_address.pk}/", {"name": "Jane Doe"}
        )
        response_2 = self.client.patch(
            f"/api/addresses/{self.other_user_address.pk}/", {"name": "Jane Doe"}
        )
        self.test_user_address.refresh_from_db()
        self.other_user_address.refresh_from_db()
        self.assertEqual(
            response_1.status_code, 200, "Failed to update test user address."
        )
        self.assertEqual(
            self.test_user_address.name,
            "Jane Doe",
            "Failed to update name field of test user address.",
        )
        self.assertEqual(
            response_2.status_code,
            404,
            "Users must only be allowed to update their own addresses.",
        )
        self.assertEqual(
            self.other_user_address.name,
            self.other_user_address_data["name"],
            "Users must not be able to edit other user's addresses",
        )

    def test_delete_address(self):
        self.create_addresses()
        response_1 = self.client.delete(
            f"/api/addresses/{self.test_user_address.pk}/"
        )
        response_2 = self.client.delete(
            f"/api/addresses/{self.other_user_address.pk}/"
        )
        self.assertEqual(
            response_1.status_code, 204, "Failed to delete test user address."
        )
        self.assertFalse(
            Address.objects.filter(pk=self.test_user_address.pk).exists(),
            "Failed to delete test user address.",
        )
        self.assertEqual(
            response_2.status_code,
            404,
            "Users must only be allowed to delete their own addresses.",
        )
        self.assertTrue(
            Address.objects.filter(pk=self.other_user_address.pk).exists(),
            "Users must not be able to edit other user's addresses",
        )

from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework.reverse import reverse

from .models import CustomUser, Address, BankAccount, WithdrawalTransaction, FeeTransaction
from .serializers import BankAccountSerializer, AddressSerializer, TransactionModelSerializer


class TestUsersMixin():
    def setUp(self):
        self.test_user = CustomUser.objects.create_user(
            email= "test_user@mail.com",
            password= "userword",
            display_name= "test_user",
            account_type= "individual",
        )
        self.test_user_login_credentials = {"email": "test_user@mail.com", "password": "userword"}
        self.other_user = CustomUser.objects.create_user(
            email="other_user@mail.com",
            password="userword",
            display_name="other_user",
            account_type="individual",
        )
        self.other_user_login_credentials = {"email": "other_user@mail.com", "password": "userword"}


class TestAddressesMixin(TestUsersMixin):
    def setUp(self):
        super().setUp()
        self.test_user_address = Address.objects.create(
            user=self.test_user,
            name="Test User",
            street="Test Street",
            zip_code="10000",
            locality='Test Town',
            country="AU",
        )
        self.other_user_address = Address.objects.create(
            user=self.test_user,
            name="Other User",
            street="Other Street",
            zip_code="22222",
            locality='Other Town',
            country="DE",
        )


class TestBankAccountsMixin(TestAddressesMixin):
    def setUp(self):
        super().setUp()
        self.test_user_bank = BankAccount.objects.create(
            user=self.test_user,
            owner="Test User",
            address=self.test_user_address,
            iban="GB00WEST0000XXXX0000XXXX00",
        )
        self.other_user_bank = BankAccount.objects.create(
            user=self.other_user,
            owner="Other User",
            address=self.other_user_address,
            iban="GB00EAST0000XXXX0000XXXX00",
        )


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


class AddressViewSetTest(APITestCase):
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


class WithdrawalTransactionTest(TestBankAccountsMixin):
    def setUp(self):
        super().setUp()
        self.client.login(
            email="test_user@mail.com",
            password="userword",
        )
        self.test_user.funds = 100
        self.test_user.save()
        self.url = '/api/withdraw/'

    def test_unauthorized_transcactions(self):
        # bank account owner does not match
        response = self.client.post(self.url, {
            'action_bank_account': self.other_user_bank.pk,
            'amount': 200000000,
        })

        self.other_user.refresh_from_db()

        self.assertEqual(response.status_code, 403, f"Request user must be bank account owner.")
        # note we only set test_user's funds to 100
        self.assertEqual(self.other_user.funds, 0, f"Unauthorised transactions must not go through.")

    def test_invalid_negative_deposit(self):
        response = self.client.post(self.url, {
            'action_bank_account': self.test_user_bank.pk,
            'amount': -20,
        })

        self.test_user.refresh_from_db()

        self.assertEqual(response.status_code, 400, f"Transactions must be greater than zero.")
        self.assertEqual(self.test_user.funds, 100, f"Negative amount transactions must not go through.")

    def test_invalid_zero_deposit(self):
        response = self.client.post(self.url, {
            'action_bank_account': self.test_user_bank.pk,
            'amount': 0,
        })

        self.test_user.refresh_from_db()

        self.assertEqual(response.status_code, 400, f"Transactions must be greater than zero.")
        self.assertEqual(self.test_user.funds, 100, f"Zero amount transactions must not change funds.")


class WithdrawalTransactionTest(TestBankAccountsMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.client.login(
            email="test_user@mail.com",
            password="userword",
        )
        self.test_user.funds = 100
        self.test_user.save()

    def test_valid_withdrawal(self):
        response = self.client.post('/api/withdraw/', {
            'action_bank_account': self.test_user_bank.pk,
            'amount': 20,
        })

        self.test_user.refresh_from_db()

        self.assertEqual(response.status_code, 201, "Failed to create withdrawal.")
        self.assertEqual(self.test_user.funds, 80, "Failed to decrease funds through withdrawal.")

    def test_invalid_amount_withdrawal(self):
        response = self.client.post('/api/withdraw/', {
            'action_bank_account': self.test_user_bank.pk,
            'amount': 999,
        })

        self.test_user.refresh_from_db()

        self.assertEqual(response.status_code, 400, "User must not be allowed to withdraw more than their funds.")
        self.assertEqual(self.test_user.funds, 100, "Larger than user funds amounts must not go through.")


class TransactionGenericViewSetTest(TestBankAccountsMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.client.login(
            email="test_user@mail.com",
            password="userword",
        )
        self.test_user.funds = 100
        self.test_user.save()
        self.withdrawal = WithdrawalTransaction.objects.create(
            amount=25,
            action_bank_account=self.test_user_bank          
        )
        self.push_ad_fee = FeeTransaction.objects.create(
            kind="push_ad",
            payer_bank_account=self.test_user_bank
        )

    def test_valid_listing(self):
        response = self.client.get("/api/transactions/")
        self.assertEqual(response.status_code, 200, "Failed to list user transactions.")
        self.assertEqual(
            response.data,
            TransactionModelSerializer(self.test_user.transactions.all(), many=True).data,
            "Listed transactions data do not match with user transactions data."
        )

    


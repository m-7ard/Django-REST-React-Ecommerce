from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager
from django.core.validators import RegexValidator

from commons import LIST_OF_COUNTRIES

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email Required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()

        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    ACCOUNT_TYPES = (
        ("individual", "Individual Account"),
        ("business", "Business Account"),
    )
    objects = CustomUserManager()

    email = models.EmailField("email", unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_banned = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    display_name = models.CharField(max_length=50)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    avatar = models.ImageField(default="default.png")
    funds = models.IntegerField(default=0)
    default_bank = models.OneToOneField('BankAccount', on_delete=models.RESTRICT, null=True)
    default_address = models.OneToOneField('Address', on_delete=models.RESTRICT, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["display_name"]


class Transaction(models.Model):
    amount = models.PositiveIntegerField()
    date = models.DateTimeField(auto_now_add=True)


class BankTransaction(models.Model):
    KINDS = (
        ("deposit", "Deposit"),
        ("withdrawal", "Withdrawal"),
    )

    kind = models.CharField(max_length=20, choices=KINDS)


class PaymentTransaction(models.Model):
    sender = models.ForeignKey(
        CustomUser,
        related_name="sent_transactions",
        on_delete=models.SET_NULL,
        null=True,
    )
    receiver = models.ForeignKey(
        CustomUser,
        related_name="received_transactions",
        on_delete=models.SET_NULL,
        null=True,
    )


class Address(models.Model):
    user = models.ForeignKey(CustomUser, related_name='addresses', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    street = models.CharField(max_length=500)
    locality = models.CharField(max_length=500)
    zip_code = models.CharField(
        max_length=32,
        validators=[RegexValidator(r"^\d+$", "Only numeric characters are allowed.")],
    )
    country = models.CharField(max_length=100, choices=LIST_OF_COUNTRIES)


class BankAccount(models.Model):
    user = models.ForeignKey(CustomUser, related_name='bank_accounts', on_delete=models.CASCADE)
    owner = models.CharField(max_length=100)
    address = models.ForeignKey(Address, related_name='attached_to', on_delete=models.RESTRICT)
    iban = models.CharField(max_length=32)
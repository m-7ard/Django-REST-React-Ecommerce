from django.db import models, IntegrityError
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager
from django.core.validators import RegexValidator

from commons import LIST_OF_COUNTRIES


def perform_transfer(amount, sender=None, receiver=None):
    if sender:
        sender.funds -= amount
        sender.save()
    
    if receiver:
        receiver.funds += amount
        receiver.save()


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
    KINDS = (
        ('bank_transaction', 'Bank Transaction'),
        ('payment_transaction', 'Payment Transaction'),
        ('fee_transaction', 'Fee Transaction'),
    )
    
    kind = models.CharField(max_length=20, choices=KINDS)
    visible_to = models.ManyToManyField(CustomUser, related_name='transactions', editable=False)

    @property
    def transaction_object(self):
        return getattr(self, self.kind)
    
    @property
    def name(self):
        return self.transaction_object.name
    
    @property
    def type_of(self):
        return self.transaction_object.type_of
    

class TransactionType(models.Model):
    amount = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)
    action_bank_account = models.ForeignKey('BankAccount', related_name='+', on_delete=models.SET_NULL, null=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        creating = self._state.adding
        if creating:
            self.check_and_perform_transfer()
            self.transaction = Transaction.objects.create(kind=self.TRANSACTION_TYPE)
            self.transaction.visible_to.set(self.get_visible_to())

        super().save(*args, **kwargs)


class BankTransaction(TransactionType):
    TRANSACTION_TYPE = 'bank_transaction'
    KINDS = (
        ("deposit", "Deposit"),
        ("withdrawal", "Withdrawal"),
    )

    kind = models.CharField(max_length=20, choices=KINDS)
    transaction = models.OneToOneField(Transaction, related_name='bank_transaction', on_delete=models.SET_NULL, null=True)

    def get_visible_to(self):
        return [self.action_bank_account.user]
    
    def check_and_perform_transfer(self):
        user = self.action_bank_account.user
        if self.kind == 'deposit':
            perform_transfer(self.amount, receiver=user)
        elif self.kind == 'withdrawal':
            if user.funds < self.amount:
                raise IntegrityError("Withdrawal amount cannot be larger than user funds.")
            perform_transfer(self.amount, sender=user)


class PaymentTransaction(TransactionType):
    TRANSACTION_TYPE = 'payment_transaction'
    KINDS = (
        ('payment', 'Payment'),
        ('refund', 'Refund')    
    )

    kind = models.CharField(max_length=30, choices=KINDS)
    sender = models.ForeignKey(
        CustomUser,
        related_name="sent_payments",
        on_delete=models.SET_NULL,
        null=True,
    )
    receiver = models.ForeignKey(
        CustomUser,
        related_name="received_payments",
        on_delete=models.SET_NULL,
        null=True,
    )
    transaction = models.OneToOneField(Transaction, related_name='payment_transaction', on_delete=models.SET_NULL, null=True)


class FeeTransaction(TransactionType):
    TRANSACTION_TYPE = 'fee_transaction'
    KINDS = (
        ('highlight_ad', 'Highlight Ad'),
    )

    kind = models.CharField(max_length=30, choices=KINDS)
    transaction = models.OneToOneField(Transaction, related_name='fee_transaction', on_delete=models.SET_NULL, null=True)


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
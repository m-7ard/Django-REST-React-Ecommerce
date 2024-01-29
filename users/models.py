from django.db import models, IntegrityError
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager
from django.core.validators import RegexValidator
from django.apps import apps

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
    funds = models.FloatField(default=0)
    default_bank = models.OneToOneField(
        "BankAccount", on_delete=models.RESTRICT, null=True
    )
    default_address = models.OneToOneField(
        "Address", on_delete=models.RESTRICT, null=True
    )
    bookmarks = models.ManyToManyField('store.Ad', related_name='bookmarks')

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["display_name"]

    def save(self, *args, **kwargs):
        creating = self._state.adding
        super().save(*args, **kwargs)

        if creating:
            Cart = apps.get_model('store', 'Cart')
            Cart.objects.create(kind='user', user=self)


class Transaction(models.Model):
    KINDS = (
        ("withdrawal", "Withdrawal Transaction"),
        ("payment_transaction", "Payment Transaction"),
        ("fee_transaction", "Fee Transaction"),
    )

    kind = models.CharField(max_length=20, choices=KINDS)
    visible_to = models.ManyToManyField(
        CustomUser, related_name="transactions", editable=False
    )
    date = models.DateTimeField(auto_now_add=True)

    @property
    def transaction_object(self):
        return getattr(self, self.kind)

    @property
    def label(self):
        return self.transaction_object.label

    @property
    def subkind(self):
        return self.transaction_object.subkind

    @property
    def signed_amount(self):
        return self.transaction_object.signed_amount


class TransactionType(models.Model):
    amount = models.FloatField()

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        creating = self._state.adding
        if creating:
            self.check_and_perform_transfer()
            self.transaction = Transaction.objects.create(kind=self.TRANSACTION_TYPE)
            self.transaction.visible_to.set(self.get_visible_to())

        super().save(*args, **kwargs)


class WithdrawalTransaction(TransactionType):
    """
    
    Note: this was originally BankTransaction, featuring
    'Withdrawal' and 'Deposit' as KINDS, but in a realistic
    scenario, funds should only represent funds received
    through sales, and that amount should not be able to be
    used for in-site purchases, due to tax reasons and the like.
    
    """
    TRANSACTION_TYPE = "withdrawal"
    transaction = models.OneToOneField(
        Transaction,
        related_name="withdrawal",
        on_delete=models.SET_NULL,
        null=True,
    )
    action_bank_account = models.ForeignKey(
        "BankAccount", related_name="+", on_delete=models.SET_NULL, null=True
    )

    def get_visible_to(self):
        return [self.action_bank_account.user]

    def check_and_perform_transfer(self):
        user = self.action_bank_account.user
        if user.funds < self.amount:
            raise IntegrityError(
                "Withdrawal amount cannot be larger than user funds."
            )

        user.funds -= self.amount
        user.save()
            
    @property
    def label(self):
        if self.action_bank_account:
            return self.action_bank_account.iban

        return ""

    @property
    def signed_amount(self):
        return self.amount * -1

    @property
    def subkind(self):
        return "Withdrawal"


class PaymentTransaction(TransactionType):
    TRANSACTION_TYPE = "payment_transaction"
    KINDS = (("payment", "Payment"), ("refund", "Refund"))

    kind = models.CharField(max_length=30, choices=KINDS)
    sender_bank_account = models.ForeignKey(
        "BankAccount",
        related_name="sent_payments",
        on_delete=models.SET_NULL,
        null=True,
    )
    receiver_bank_account = models.ForeignKey(
        "BankAccount",
        related_name="received_payments",
        on_delete=models.SET_NULL,
        null=True,
    )
    transaction = models.OneToOneField(
        Transaction,
        related_name="payment_transaction",
        on_delete=models.SET_NULL,
        null=True,
    )


class FeeTransaction(TransactionType):
    TRANSACTION_TYPE = "fee_transaction"
    KINDS = (
        ("push_ad", "Push Ad"),
        ("highlight_ad", "Highlight Ad"),
        ("top_ad", "Top Ad"),
        ("gallery_ad", "Gallery Ad"),
    )
    AMOUNT_MAP = {
        "push_ad": 2.95,
        "highlight_ad": 3.95,
        "top_ad": 15.95,
        "gallery_ad": 25.95,
    }

    kind = models.CharField(max_length=30, choices=KINDS)
    transaction = models.OneToOneField(
        Transaction,
        related_name="fee_transaction",
        on_delete=models.SET_NULL,
        null=True,
    )
    payer_bank_account = models.ForeignKey(
        "BankAccount", related_name="+", on_delete=models.SET_NULL, null=True
    )

    def save(self, *args, **kwargs):
        creating = self._state.adding
        if creating:
            self.amount = self.AMOUNT_MAP[self.kind]
            
        super().save(*args, **kwargs)

    def check_and_perform_transfer(self):
        # e.g. Request payment from the user bank
        pass

    def get_visible_to(self):
        return [self.payer_bank_account.user]

    @property
    def label(self):
        return "Fee Payment"

    @property
    def signed_amount(self):
        return self.amount * -1

    @property
    def subkind(self):
        return self.get_kind_display()


class Address(models.Model):
    user = models.ForeignKey(
        CustomUser, related_name="addresses", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    street = models.CharField(max_length=500)
    locality = models.CharField(max_length=500)
    zip_code = models.CharField(
        max_length=32,
        validators=[RegexValidator(r"^\d+$", "Only numeric characters are allowed.")],
    )
    country = models.CharField(max_length=100, choices=LIST_OF_COUNTRIES)


class BankAccount(models.Model):
    user = models.ForeignKey(
        CustomUser, related_name="bank_accounts", on_delete=models.CASCADE
    )
    owner = models.CharField(max_length=100)
    address = models.ForeignKey(
        Address, related_name="attached_to", on_delete=models.RESTRICT
    )
    iban = models.CharField(max_length=32)

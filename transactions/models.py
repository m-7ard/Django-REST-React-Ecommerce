from django.db import models, IntegrityError, transaction

from users.models import CustomUser, BankAccount
from users.serializers import PublicUserSerializer
from store.models import Order
from store.serializers import OrderSerializer


class LedgerEntry(models.Model):
    KINDS = (
        ("order_transaction", "Order Transaction"),
    )
    kind = models.CharField(max_length=30, choices=KINDS)
    signed_amount = models.DecimalField(max_digits=20, decimal_places=2)
    user = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, related_name="ledger_entries", null=True
    )
    user_archive = models.JSONField()
    transaction_data = models.JSONField()
    date_created = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        creating = self._state.adding
        if not creating:
            raise IntegrityError("Cannot edit ledger entries.")

        self.user_archive = PublicUserSerializer(self.user).data
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-date_created']


class OrderTransaction(models.Model):
    sender = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, related_name="+", null=True
    )
    receiver = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, related_name="+", null=True
    )
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    date_created = models.DateTimeField(auto_now_add=True)
    archive = models.JSONField(default=dict)
    order = models.OneToOneField(
        Order, on_delete=models.SET_NULL, related_name="+", null=True
    )

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        creating = self._state.adding
        if not creating:
            raise IntegrityError("Cannot edit transactions.")

        self.amount = self.order.total
        self._validate_and_update()
        self.archive = {
            "order": OrderSerializer(self.order).data,
            "sender": PublicUserSerializer(self.sender).data,
            "receiver": PublicUserSerializer(self.receiver).data,
        }

        with transaction.atomic():
            self._perform_payment()
            super().save(*args, **kwargs)
            LedgerEntry.objects.create(
                kind="order_transaction",
                signed_amount=self.amount,
                user=self.receiver,
                transaction_data={
                    "subkind": self.SUBKIND,
                    "pk": self.pk,
                    **self.archive
                },
            )
            LedgerEntry.objects.create(
                kind="order_transaction",
                signed_amount=self.amount * -1,
                user=self.sender,
                transaction_data={
                    "subkind": self.SUBKIND,
                    "pk": self.pk,
                    **self.archive
                },
            )

    def _validate_and_update(self):
        raise NotImplementedError("Subclasses must implement this method.")

    def _perform_payment(self):
        raise NotImplementedError("Subclasses must implement this method.")

    def __str__(self) -> str:
        return f"Order #{self.archive['order']['pk']}"


class OrderPayment(OrderTransaction):
    SUBKIND = "payment"

    def _validate_and_update(self):
        self.sender = self.order.buyer
        self.receiver = self.order.seller

        if self.order is None or self.sender is None or self.receiver is None:
            raise IntegrityError("FKs cannot be null during creation.")

    def _perform_payment(self):
        self.receiver.seller_funds += self.amount
        self.receiver.save()


class OrderRefund(OrderTransaction):
    SUBKIND = "refund"

    def _validate_and_update(self):
        self.sender = self.order.seller
        self.receiver = self.order.buyer

        if self.order is None or self.sender is None or self.receiver is None:
            raise IntegrityError("FKs cannot be null during creation.")

        if not OrderPayment.objects.filter(order=self.order).exists():
            raise IntegrityError("Cannot refund unpaid order.")

    def _perform_payment(self):
        self.sender.seller_funds -= self.amount
        self.sender.save()


class AdBoostTransaction(models.Model):
    sender = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, related_name="+", null=True
    )



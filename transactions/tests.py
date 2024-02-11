from django.test import TestCase
from rest_framework.test import APITestCase

from .models import OrderPayment, OrderRefund, LedgerEntry
from store.tests import TestOrderMixin
from users.tests import TestBankAccountsMixin


class LedgerEntryTest(APITestCase, TestBankAccountsMixin, TestOrderMixin):
    def setUp(self):
        TestBankAccountsMixin.setUp(self)
        TestOrderMixin.setUp(self)
        self.client.login(email="test_user@mail.com", password="userword")

    def test_order_payment_transaction_ledger_creation(self):
        payment = OrderPayment.objects.create(order=self.test_user_order)
        seller_ledger_entry = LedgerEntry.objects.get(
            kind="order_transaction",
            transaction_data__subkind=OrderPayment.SUBKIND,
            transaction_data__pk=payment.pk,
            user=payment.order.seller,
        )
        buyer_ledger_entry = LedgerEntry.objects.get(
            kind="order_transaction",
            transaction_data__subkind=OrderPayment.SUBKIND,
            transaction_data__pk=payment.pk,
            user=payment.order.buyer,
        )

        self.assertEqual(seller_ledger_entry.signed_amount, payment.amount)
        self.assertEqual(buyer_ledger_entry.signed_amount, payment.amount * -1)

    def test_order_refund_transaction_ledger_creation(self):
        OrderPayment.objects.create(order=self.test_user_order)
        refund = OrderRefund.objects.create(order=self.test_user_order)
        seller_ledger_entry = LedgerEntry.objects.get(
            kind="order_transaction",
            transaction_data__subkind=OrderRefund.SUBKIND,
            transaction_data__pk=refund.pk,
            user=refund.order.seller,
        )
        buyer_ledger_entry = LedgerEntry.objects.get(
            kind="order_transaction",
            transaction_data__subkind=OrderRefund.SUBKIND,
            transaction_data__pk=refund.pk,
            user=refund.order.buyer,
        )

        self.assertEqual(seller_ledger_entry.signed_amount, refund.amount * -1)
        self.assertEqual(buyer_ledger_entry.signed_amount, refund.amount)

from django.contrib import admin
from .models import OrderPayment, OrderRefund, LedgerEntry

admin.site.register(OrderPayment)
admin.site.register(OrderRefund)
admin.site.register(LedgerEntry)
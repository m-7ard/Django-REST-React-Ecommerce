from django.contrib import admin
from django.contrib.sessions.models import Session

from .models import (
    CustomUser, 
    Address, 
    BankAccount, 
    Transaction,
    FeeTransaction
)


admin.site.register(CustomUser)
admin.site.register(Address)
admin.site.register(BankAccount)
admin.site.register(Transaction)
admin.site.register(FeeTransaction)
admin.site.register(Session)

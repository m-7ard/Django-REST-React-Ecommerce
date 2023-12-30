from django.contrib import admin

from .models import CustomUser, Address, BankAccount, Transaction


admin.site.register(CustomUser)
admin.site.register(Address)
admin.site.register(BankAccount)
admin.site.register(Transaction)

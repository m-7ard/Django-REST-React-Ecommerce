from django.shortcuts import render
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from .serializers import LedgerEntrySerializer


class ListUserTransactions(ListAPIView):
    permission_classes = [
        IsAuthenticated,
    ]
    serializer_class = LedgerEntrySerializer

    def get_queryset(self):
        user = self.request.user
        return user.ledger_entries.all()

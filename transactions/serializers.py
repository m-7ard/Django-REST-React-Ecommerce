from rest_framework import serializers

from .models import LedgerEntry


class LedgerEntrySerializer(serializers.ModelSerializer):
    date_created = serializers.DateTimeField(
        format="%Y.%m.%d %H:%M:%S", required=False, read_only=True
    )

    class Meta:
        model = LedgerEntry
        fields = [
            "pk",
            "kind",
            "user",
            "user_archive",
            "transaction_data",
            "date_created",
        ]

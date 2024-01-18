from django.contrib.auth.password_validation import validate_password
from django.contrib.sessions.models import Session
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from .models import CustomUser, Address, BankAccount, WithdrawalTransaction, Transaction


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["display_name", "account_type", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = CustomUser(**validated_data)

        user.set_password(validated_data["password"])
        user.save()

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(write_only=True)
    password = serializers.CharField(
        style={"input_type": "password"}, trim_whitespace=False, write_only=True
    )

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = authenticate(
                request=self.context.get("request"), email=email, password=password
            )

            if not user:
                raise serializers.ValidationError(
                    "Access denied: wrong email or password.", code="authorization"
                )
        else:
            raise serializers.ValidationError(
                'Both "email" and "password" are required.', code="authorization"
            )

        attrs["user"] = user
        return attrs


class VisitorUserSerializer(serializers.ModelSerializer):
    cart = serializers.SerializerMethodField()

    def get_cart(self, instance):
        from store.serializers import CartSerializer
        return CartSerializer(instance.cart).data

    class Meta:
        model = Session
        fields = ["cart"]


class FullUserSerializer(serializers.ModelSerializer):
    date_joined = serializers.DateTimeField(
        format="%Y.%m.%d", required=False, read_only=True
    )
    default_bank = serializers.PrimaryKeyRelatedField(read_only=True)
    default_address = serializers.PrimaryKeyRelatedField(read_only=True)
    avatar = serializers.CharField(source="avatar.url")
    cart = serializers.SerializerMethodField()

    def get_cart(self, instance):
        from store.serializers import CartSerializer
        return CartSerializer(instance.cart).data

    class Meta:
        model = CustomUser
        fields = [
            "pk",
            "display_name",
            "email",
            "account_type",
            "avatar",
            "date_joined",
            "funds",
            "default_bank",
            "default_address",
            "cart",
        ]


class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["display_name", "pk"]


class AddressSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), required=False, allow_null=True
    )
    country_display = serializers.CharField(
        source="get_country_display", read_only=True
    )

    class Meta:
        model = Address
        fields = [
            "pk",
            "name",
            "street",
            "locality",
            "zip_code",
            "country",
            "country_display",
            "user",
        ]


class BankAccountSerializer(serializers.ModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)
    user = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), required=False, allow_null=True
    )
    is_default = serializers.SerializerMethodField()

    class Meta:
        model = BankAccount
        fields = [
            "pk",
            "user",
            "owner",
            "iban",
            "address",
            "is_default",
        ]

    def get_is_default(self, obj):
        return obj.pk == obj.user.default_bank
    

class TransactionModelSerializer(serializers.ModelSerializer):
    label = serializers.CharField(read_only=True)
    signed_amount = serializers.ReadOnlyField()
    subkind = serializers.CharField(read_only=True)
    date = serializers.DateTimeField(
        format="%d %b", read_only=True
    )
    
    class Meta:
        model = Transaction
        fields = [
            "label",
            "signed_amount",
            "subkind",
            "date",
        ]


class TransactionTypeSerializer(serializers.ModelSerializer):
    amount = serializers.FloatField(min_value=0.01)

    def validate_action_bank_account(self, value):
        if not value:
            raise serializers.ValidationError("Bank Account is required.")

        if not self.context['request'].user.bank_accounts.filter(pk=value.pk).exists():
            raise PermissionDenied("Request user is not bank account owner.", 403)

        return value


class WithdrawalSerializer(TransactionTypeSerializer):
    class Meta:
        model = WithdrawalTransaction
        fields = ['amount', 'action_bank_account']

    def validate_amount(self, value):
        new_balance = self.context["request"].user.funds - value
        if new_balance < 0:
            raise serializers.ValidationError("Withdrawal amount cannot be larger than user funds.")

        return value

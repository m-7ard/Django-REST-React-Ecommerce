from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth import authenticate

from .models import CustomUser, Address, BankAccount


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


class UserSerializer(serializers.ModelSerializer):
    date_joined = serializers.DateTimeField(
        format="%Y.%m.%d", required=False, read_only=True
    )
    default_bank = serializers.PrimaryKeyRelatedField(read_only=True)
    default_address = serializers.PrimaryKeyRelatedField(read_only=True)

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
        ]


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

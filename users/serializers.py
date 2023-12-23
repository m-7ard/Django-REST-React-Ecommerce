from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth import authenticate

from .models import CustomUser, Address, BankAccount


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['display_name', 'account_type', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = CustomUser(**validated_data)

        user.set_password(validated_data['password'])
        user.save()

        return user
    

class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(write_only=True)
    password = serializers.CharField(style={'input_type': 'password'}, trim_whitespace=False, write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                email=email, 
                password=password
            )

            if not user:
                raise serializers.ValidationError(
                    'Access denied: wrong email or password.', 
                    code='authorization'
                )
        else:
            raise serializers.ValidationError(
                'Both "email" and "password" are required.', 
                code='authorization'
            )

        attrs['user'] = user
        return attrs
    

class UserSerializer(serializers.ModelSerializer):
    date_joined = serializers.DateTimeField(format="%Y.%m.%d", required=False, read_only=True)

    class Meta:
        model = CustomUser
        fields = ['pk', 'display_name', 'email', 'account_type', 'avatar', 'date_joined', 'funds']


class AddressSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Address
        fields = '__all__'


class BankAccountSerializer(serializers.ModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=False, allow_null=True)
    
    class Meta:
        model = BankAccount
        fields = '__all__'

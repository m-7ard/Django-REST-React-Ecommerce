from django.contrib.auth import login, logout
from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action

from . import serializers
from .models import BankAccount, Address


class UserRegisterAPIView(mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = serializers.RegisterSerializer


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = serializers.LoginSerializer(
            data=request.data, context={"request": self.request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return Response(
            serializers.UserSerializer(user).data, status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        logout(request)
        return Response(status=status.HTTP_200_OK)


class CurrentUser(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        user = request.user

        if user.is_authenticated:
            data = serializers.UserSerializer(user).data
            return Response(data, status=status.HTTP_200_OK)

        return Response(None, status=status.HTTP_404_NOT_FOUND)


class BankAccountViewset(ModelViewSet):
    permissions_classes = [IsAuthenticated]
    serializer_class = serializers.BankAccountSerializer

    def get_queryset(self):
        return BankAccount.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            address=Address.objects.get(pk=self.request.POST.get("address")),
        )

    @action(detail=True, methods=['PATCH'], url_path='set-as-default')
    def set_as_default(self, request, pk):
        user = request.user
        bank_account = self.get_object()
        user.default_bank = bank_account
        user.save()
        return Response(status=200)



class AddressViewset(ModelViewSet):
    permissions_classes = [IsAuthenticated]
    serializer_class = serializers.AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
        )

    @action(detail=True, methods=['PATCH'], url_path='set-as-default')
    def set_as_default(self, request, pk):
        user = request.user
        address = self.get_object()
        user.default_address = address
        user.save()
        return Response(status=200)
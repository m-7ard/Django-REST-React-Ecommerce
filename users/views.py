from django.contrib.auth import login, logout
from django.apps import apps
from django.contrib.sessions.models import Session
from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import permissions
from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, GenericViewSet
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
            serializers.FullUserSerializer(user).data, status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        logout(request)
        return Response(status=status.HTTP_200_OK)


class CurrentUser(APIView):
    permission_classes = [AllowAny]

    def return_user(self, user):
        data = serializers.FullUserSerializer(user).data
        return Response(data, status=status.HTTP_200_OK)
    
    def return_visitor(self, request):
        Cart = apps.get_model('store', 'Cart')
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            visitor_session = Session.objects.get(session_key=request.session.session_key)
            Cart.objects.create(
                kind='visitor', 
                visitor=visitor_session
            )
            request.session['has_cart'] = True

            data = serializers.VisitorUserSerializer(visitor_session).data
            return Response(data, status=status.HTTP_404_NOT_FOUND)
        
        # In case of duplicate request (potentially unnecessary(?))
        visitor_session = Session.objects.get(session_key=request.session.session_key)
        data = serializers.VisitorUserSerializer(visitor_session).data
        return Response(data, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, format=None):
        user = request.user
        if user.is_authenticated:
            return self.return_user(user)
        
        return self.return_visitor(request)

        
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


class TransactionGenericViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    serializer_class = serializers.TransactionModelSerializer

    def get_queryset(self):
        return self.request.user.transactions.all()


class WithdrawalCreateAPIView(CreateAPIView):
    permissions_classes = [IsAuthenticated]
    serializer_class = serializers.WithdrawalSerializer
    
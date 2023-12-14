from django.contrib.auth import login, logout
from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from . import serializers


class UserRegisterAPIView(mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = serializers.RegisterSerializer


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = serializers.LoginSerializer(
            data=request.data,
            context={ 'request': self.request }
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return Response(
            serializers.UserSerializer(user).data, 
            status=status.HTTP_200_OK
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

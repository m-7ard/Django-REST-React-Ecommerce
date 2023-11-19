from django.views.generic import TemplateView
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework import status

from .models import Category, Ad
from .serializers import CategorySerializer, AdModelSerializer


class IndexView(TemplateView):
    template_name = 'store/frontpage.html'
    

class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    queryset = Category.objects.all()


class AdViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Ad.objects.all()
    serializer_class = AdModelSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
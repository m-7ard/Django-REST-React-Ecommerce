from django.views.generic import TemplateView, View
from django.core.files.storage import FileSystemStorage
from Django_REST_ecommerce.settings import MEDIA_ROOT
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


class AdImageFieldUploadView(View):
    def post(self, request, *args, **kwargs):
        files = request.FILES.getlist('images')
        response = {}
        # 12582912 is a mb
        for file in files:
            errors = {}
            if file.content_type not in ['image/png', 'image/jpg']:
                errors['format'] = 'Wrong format image. Only PNG and JPG is allowed.'
            if file.size > 12582912:
                errors['format'] = 'Image too big. Only up to 12mb is allowed.'

            if errors:
                response[file.name] = errors
            else:
                """ TODO: continue this """
                FileSystemStorage(MEDIA_ROOT)
                response[file.name] =
            
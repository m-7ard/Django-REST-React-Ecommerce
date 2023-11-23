from django.views.generic import TemplateView, View
from django.core.files.storage import FileSystemStorage
from django.http.response import JsonResponse
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework import status

from Django_REST_ecommerce.settings import MEDIA_ROOT, MEDIA_URL
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
        files = request.FILES.getlist('image')
        if len(files) != 1:
            return JsonResponse(status=400)
        
        file = files[0]

        if not file.content_type in ['image/png', 'image/jpeg']:
            return JsonResponse(
                {
                    'name': file.name,
                    'msg': 'Wrong format file. Only PNG and JPG is allowed.',
                }, 
                status=415
            )
        if file.size > 12582912:
            # 12582912 is 12 mb
            return JsonResponse(
                {
                    'name': file.name,
                    'msg': 'Image too big. Only up to 12mb is allowed.',
                }, 
                status=413
            )

        storage = FileSystemStorage(MEDIA_ROOT)
        stored_file_name = storage.save(file.name, file)
    
        return JsonResponse(
                {
                    'name': stored_file_name,
                    'url': MEDIA_URL + stored_file_name,
                },
                status=200
            )
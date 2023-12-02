from datetime import datetime
import random

from django.views.generic import TemplateView, View
from django.core.files.storage import FileSystemStorage
from django.http.response import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly

from Django_REST_ecommerce.settings import MEDIA_ROOT, MEDIA_URL
from .models import Category, Ad
from .serializers import CategorySerializer, AdModelSerializer
from users.models import CustomUser


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

    @action(detail=False, methods=['get'])
    def list_user_ads(self, request, pk=None):
        user = CustomUser.objects.get(pk=pk) if pk else request.user
        user_ads = Ad.objects.filter(created_by=user)
        serializer = AdModelSerializer(user_ads, many=True)
        return Response(serializer.data)


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
                'fileName': stored_file_name,
            },
            status=200
        )
    

class FrontpageApiView(APIView):
    def get(self, request, *args, **kwargs):
        valid_ads = Ad.objects.filter(expiry_date__gt=datetime.now())
        
        highlight_ads_query = valid_ads.filter(highlight_expiry__gt=datetime.now())
        highlight_ads_pks = list(highlight_ads_query.values_list('pk', flat=True))
        random_highlight_ads_pks = random.sample(
            highlight_ads_pks, 
            min(len(highlight_ads_pks), 10)
        )
        
        highlight_ads_objects = valid_ads.filter(pk__in=random_highlight_ads_pks)
        recent_ads = valid_ads.order_by('-latest_push_date')[:10]

        return Response({
            'hightlight_ads': AdModelSerializer(highlight_ads_objects, many=True).data,
            'recent_ads': AdModelSerializer(recent_ads, many=True).data,
        })
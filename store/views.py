from datetime import datetime
import random

from django.views.generic import TemplateView, View
from django.core.files.storage import FileSystemStorage
from django.http.response import JsonResponse
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticatedOrReadOnly,
    IsAuthenticated,
)
from rest_framework.exceptions import ValidationError

from .models import Category, Ad
from .serializers import CategorySerializer, AdModelSerializer, AdBoostSerializer
from users.models import CustomUser, FeeTransaction


class IndexView(TemplateView):
    template_name = "store/frontpage.html"


class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    queryset = Category.objects.all()


class AdViewSet(viewsets.ModelViewSet):
    permission_classes = [
        IsAuthenticatedOrReadOnly,
    ]
    queryset = Ad.objects.all()
    serializer_class = AdModelSerializer

    @action(methods=["POST"], detail=True)
    def boost(self, request, pk=None):
        ad = get_object_or_404(request.user.ads.all(), pk=pk)
        serializer = AdBoostSerializer(
            data=dict(self.request.data), context={"ad": ad, "request": self.request}
        )
        serializer.is_valid(raise_exception=True)
        boosts = serializer.data["boosts"]
        for boost in boosts:
            if boost == "highlight_ad":
                ad.apply_highlight_boost()
            elif boost == "top_ad":
                ad.apply_top_boost()
            elif boost == "gallery_ad":
                ad.apply_gallery_boost()
            elif boost == "push_ad":
                ad.apply_push_boost()

            FeeTransaction.objects.create(
                kind=boost,
                amount=FeeTransaction.AMOUNT_MAP[boost],
                payer=self.request.user
            )

        ad.save()
        return Response(status=200)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ListUserAds(APIView):
    def get(self, request, pk, *args, **kwargs):
        user = CustomUser.objects.get(pk=pk) if pk else request.user
        user_ads = Ad.objects.filter(created_by=user)
        serializer = AdModelSerializer(user_ads, many=True)
        return Response(serializer.data)


class AdImageFieldUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        files = request.FILES.getlist("image")
        if len(files) != 1:
            return JsonResponse(status=400)

        file = files[0]

        if not file.content_type in ["image/png", "image/jpeg"]:
            return Response(
                {
                    "name": file.name,
                    "msg": "Wrong format file. Only PNG and JPG is allowed.",
                },
                status=415,
            )
        if file.size > 12582912:
            # 12582912 is 12 mb
            return Response(
                {
                    "name": file.name,
                    "msg": "Image too big. Only up to 12mb is allowed.",
                },
                status=413,
            )

        storage = FileSystemStorage(settings.MEDIA_ROOT)
        stored_file_name = storage.save(file.name, file)

        return Response(
            {
                "fileName": stored_file_name,
            },
            status=200,
        )


class FrontpageApiView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        valid_ads = Ad.objects.filter(expiry_date__gt=datetime.now())

        highlight_ads_query = valid_ads.filter(highlight_expiry__gt=datetime.now())
        highlight_ads_pks = list(highlight_ads_query.values_list("pk", flat=True))
        random_highlight_ads_pks = random.sample(
            highlight_ads_pks, min(len(highlight_ads_pks), 10)
        )

        highlight_ads_objects = valid_ads.filter(pk__in=random_highlight_ads_pks)
        recent_ads = valid_ads.order_by("-latest_push_date")[:10]

        return Response(
            {
                "HIGHLIGHT_ADS": AdModelSerializer(
                    highlight_ads_objects, many=True
                ).data,
                "RECENT_ADS": AdModelSerializer(recent_ads, many=True).data,
            }
        )

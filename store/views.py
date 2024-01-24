from datetime import datetime
import random
import json

from django.views.generic import TemplateView, View
from django.core.files.storage import FileSystemStorage
from django.http.response import JsonResponse
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.contrib.sessions.models import Session
from rest_framework import status
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticatedOrReadOnly,
    IsAuthenticated,
)

from .models import Category, Ad, CartItem, AdGroup
from .serializers import (
    CategorySerializer,
    AdModelSerializer,
    AdBoostSerializer,
    CartItemSerializer,
    CartAdSerializer,
    AdGroupSerializer,
)
from .paginators import AdSearchPaginator
from users.models import CustomUser, FeeTransaction
from commons import paginate


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
    pagination_class = AdSearchPaginator

    @action(methods=["POST"], detail=True)
    def boost(self, request, pk=None):
        ad = get_object_or_404(request.user.ads.all(), pk=pk)
        payer_bank_account = get_object_or_404(request.user.bank_accounts.all(), pk=request.data.get('payer_bank_account'))
        serializer = AdBoostSerializer(
            data=dict(self.request.data), context={
                "request": self.request,
                "ad": ad, 
                "payer_bank_account": payer_bank_account
            }
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
                payer_bank_account=payer_bank_account,
            )

        ad.save()
        return Response(status=status.HTTP_200_OK)

    @paginate
    @action(methods=["GET"], detail=False)
    def search(self, request):
        ads = Ad.objects.all()
        query_search = request.query_params.get("q")
        min_price = int(request.query_params.get("min_price", 0))
        max_price = request.query_params.get("max_price")
        category = request.query_params.get("category")

        if query_search:
            ads = ads.filter(title__icontains=query_search)
        if min_price:
            ads = ads.filter(price__gte=min_price)
        if max_price:
            ads = ads.filter(price__lte=max(min_price, max_price))
        if category:
            ads = ads.filter(category__pk=category)

        return ads

    @action(methods=["GET"], detail=True)
    def add_to_cart(self, request, pk=None):
        if request.user.is_authenticated:
            user = request.user
            cart = user.cart
        else:
            visitor_session = Session.objects.get(
                session_key=request.session.session_key
            )
            cart = visitor_session.cart

        ad = self.get_object()
        
        item = cart.items.get(ad=ad)
        return Response(
            CartItemSerializer(item).data, status=status.HTTP_200_OK
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ListUserAds(APIView):
    def get(self, request, pk, *args, **kwargs):
        user = CustomUser.objects.get(pk=pk) if pk else request.user
        user_ads = Ad.objects.filter(created_by=user).order_by('-date_created')
        serializer = AdModelSerializer(user_ads, many=True)
        return Response(serializer.data)


class AdImageFieldUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        files = request.FILES.getlist("image")
        if len(files) != 1:
            return JsonResponse(status=status.HTTP_400_BAD_REQUEST)

        file = files[0]

        if not file.content_type in ["image/png", "image/jpeg"]:
            return Response(
                {
                    "name": file.name,
                    "msg": "Wrong format file. Only PNG and JPG is allowed.",
                },
                status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            )
        if file.size > 12582912:
            # 12582912 is 12 mb
            return Response(
                {
                    "name": file.name,
                    "msg": "Image too big. Only up to 12mb is allowed.",
                },
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )

        storage = FileSystemStorage(settings.MEDIA_ROOT)
        stored_file_name = storage.save(file.name, file)

        return Response(
            {
                "fileName": stored_file_name,
            },
            status=status.HTTP_200_OK,
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


class ConfirmCheckoutAPIView(APIView):
    def post(self, request, *args, **kwargs):
        items = json.loads(request.POST.get("items", "[]"))
        errors = {}
        fields_to_compare = ["price", "title", "unlisted", "shipping", "condition"]

        if request.user.is_authenticated:
            cart = request.user.cart
        else:
            visitor_session = Session.objects.get(
                session_key=request.session.session_key
            )
            cart = visitor_session.cart

        cart_items_pks = cart.items.values_list("pk", flat=True)
        for item in items:
            changes = {}
            item_errors = {}

            if item["pk"] not in cart_items_pks:
                item_errors['item'] = f'"{item["ad"]["title"]}" is no longer in cart.'
                
                errors[item["pk"]] = {
                    "changes": changes,
                    "item_errors": item_errors,
                }
                continue
            
            ad_data = CartAdSerializer(Ad.objects.get(pk=item["ad"]["pk"])).data
            if item["amount"] > ad_data["available"]:
                item_errors['amount'] = f'Amount cannot be greater than available.'
            
            if item["amount"] <= 0:
                item_errors['amount'] = f'Invalid amount.'

            for field in fields_to_compare:
                if item["ad"][field] != ad_data[field]:
                    changes[field] = [item["ad"][field], ad_data[field]]

            if changes or item_errors:
                errors[item["pk"]] = {
                    "changes": changes,
                    "item_errors": item_errors,
                }

        if errors:
            return Response(
                {
                  "items": CartItemSerializer(cart.items.all(), many=True).data, 
                  "errors": errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(status=status.HTTP_200_OK)
    

class AdGroupViewSet(viewsets.ModelViewSet):
    permission_classes = [
        IsAuthenticatedOrReadOnly,
    ]
    serializer_class = AdGroupSerializer

    def get_queryset(self):
        return self.request.user.ad_groups.all()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    

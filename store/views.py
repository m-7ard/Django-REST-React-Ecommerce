from datetime import datetime
from collections import defaultdict
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
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.generics import ListAPIView, GenericAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticatedOrReadOnly,
    IsAuthenticated,
)

from .models import Category, Ad, CartItem, Order
from .serializers import (
    CategorySerializer,
    AdModelSerializer,
    AdBoostSerializer,
    CartItemSerializer,
    AdGroupSerializer,
    PublicAdModelSerializer,
    CheckoutSerializer,
    OrderSerializer,
    CheckoutItemSerializer,
)
from .paginators import AdPaginator
from users.models import CustomUser, FeeTransaction
from transactions.models import OrderPayment, OrderRefund
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
    pagination_class = AdPaginator

    @action(methods=["POST"], detail=True)
    def boost(self, request, pk=None):
        ad = get_object_or_404(request.user.ads.all(), pk=pk)
        payer_bank_account = get_object_or_404(
            request.user.bank_accounts.all(), pk=request.data.get("payer_bank_account")
        )
        serializer = AdBoostSerializer(
            data=dict(self.request.data),
            context={
                "request": self.request,
                "ad": ad,
                "payer_bank_account": payer_bank_account,
            },
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
        min_price = request.query_params.get("min_price")
        max_price = request.query_params.get("max_price")
        category = request.query_params.get("category")

        if query_search is not None:
            ads = ads.filter(title__icontains=query_search)
        if min_price is not None:
            if max_price is not None and int(min_price) > int(max_price):
                min_price, max_price = max_price, min_price

            ads = ads.filter(price__gte=int(min_price))
        if max_price is not None:
            ads = ads.filter(price__lte=int(max_price))
        if category is not None:
            ads = ads.filter(category__pk=int(category))

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
        if request.user.is_authenticated and ad.created_by == request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)

        item = cart.items.filter(ad=ad).first()
        if not item:
            amount = int(request.query_params.get("amount"))
            if amount > ad.available or amount < 1:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            item = CartItem.objects.create(ad=ad, cart=cart, amount=amount)
            return Response(
                CartItemSerializer(item).data, status=status.HTTP_201_CREATED
            )

        return Response(CartItemSerializer(item).data, status=status.HTTP_200_OK)

    @action(methods=["POST"], detail=True)
    def remove_from_cart(self, request, pk=None):
        if request.user.is_authenticated:
            user = request.user
            cart = user.cart
        else:
            visitor_session = Session.objects.get(
                session_key=request.session.session_key
            )
            cart = visitor_session.cart

        ad = self.get_object()
        item = cart.items.filter(ad=ad).first()
        if not item:
            return Response(status=status.HTTP_200_OK)

        item.delete()
        return Response(status=status.HTTP_200_OK)

    @action(methods=["POST"], detail=True)
    def add_to_bookmarks(self, request, pk):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        
        ad = self.get_object()
        request.user.bookmarks.add(ad)
        return Response(status=status.HTTP_200_OK)
    

    @action(methods=["POST"], detail=True)
    def remove_from_bookmarks(self, request, pk):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        
        ad = self.get_object()
        request.user.bookmarks.remove(ad)
        return Response(status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ListUserAds(APIView):
    def get(self, request, pk, *args, **kwargs):
        user = CustomUser.objects.get(pk=pk) if pk else request.user
        user_ads = Ad.objects.filter(created_by=user).order_by("-date_created")
        serializer = AdModelSerializer(user_ads, many=True)
        return Response(serializer.data)
    

class ListUserBookmarks(ListAPIView):
    permission_classes = [
        IsAuthenticated,
    ]
    pagination_class = AdPaginator
    serializer_class = PublicAdModelSerializer

    def get_queryset(self):
        user = self.request.user
        return user.bookmarks.all()
    
        
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
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        items = json.loads(request.POST.get("items", "[]"))
        errors = defaultdict(list)

        if len(items) == 0:
            errors["non_field_errors"].append("No items to perform checkout.")

        cart = request.user.cart
        cart_items_pks = cart.items.values_list("pk", flat=True)
        valid_items = []

        for item in items:
            if item["pk"] not in cart_items_pks:
                errors["non_field_errors"].append(f'"{item["title"]}" is no longer in the cart.')
            else:
                valid_items.append(item)

        for item in valid_items:
            item_errors = {}
            item_serializer = CheckoutItemSerializer(data=item, context={'request': request})
            if not item_serializer.is_valid():
                item_errors.update(item_serializer.errors)

            if item_errors:
                errors[item["pk"]] = item_errors

        if errors:
            return Response(
                {
                    'errors': dict(errors),
                    'items': CartItemSerializer(cart.items.all(), many=True).data
                },
                status=status.HTTP_400_BAD_REQUEST,
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


class CreateOrderAPIView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CheckoutSerializer


class ListUserOrders(ListAPIView):
    permission_classes = [
        IsAuthenticated,
    ]
    serializer_class = OrderSerializer
    # TODO: add pagination

    def get_queryset(self):
        user = self.request.user
        return user.orders.all()
    

class ListUserSales(ListAPIView):
    permission_classes = [
        IsAuthenticated,
    ]
    serializer_class = OrderSerializer
    # TODO: add pagination

    def get_queryset(self):
        user = self.request.user
        return user.sales.all()


class OrderViewSet(viewsets.GenericViewSet, RetrieveModelMixin):
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @action(methods=["POST"], detail=True)
    def cancel(self, request, pk):
        order = self.get_object()
        if request.user not in [order.buyer, order.seller]:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
    
        if order.status != 'pending_payment':
            return Response(status=status.HTTP_400_BAD_REQUEST)

        refund, created = OrderRefund.objects.get_or_create(order=order)

        if created:
            order.status = 'cancelled'
            order.save()
            return Response(status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=True)
    def confirm_payment(self, request, pk):
        order = self.get_object()
        if request.user != order.buyer:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
    
        if order.status != 'pending_payment':
            return Response(status=status.HTTP_400_BAD_REQUEST)

        payment, created = OrderPayment.objects.get_or_create(order=order)

        if created:
            order.status = "pending_shipping"
            order.save()
            return Response(data=OrderSerializer(order).data , status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    @action(methods=["PATCH"], detail=True)
    def confirm_shipping(self, request, pk):
        order = self.get_object()
        if request.user != order.seller:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
    
        to_update = {
            'tracking_number': request.data.get('tracking_number')    
        }
        serializer = OrderSerializer(order, data=to_update, partial=True)
        if serializer.is_valid():
            serializer.save(status='shipped')
            return Response(status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
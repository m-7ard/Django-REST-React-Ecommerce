import json
import re
from collections import defaultdict

from django.core.files.storage import FileSystemStorage
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from Django_REST_ecommerce.settings import MEDIA_ROOT
from .models import Category, Ad, Cart, CartItem, AdGroup, Order
from users.models import FeeTransaction, CustomUser, Address, BankAccount
from users.serializers import FullUserSerializer, PublicUserSerializer


class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
    )

    class Meta:
        model = Category
        fields = ["pk", "name", "parent"]


class AdGroupAdSerializer(serializers.ModelSerializer):
    specifications = serializers.JSONField(read_only=True)

    class Meta:
        model = Ad
        fields = ["title", "specifications", "pk"]


class AdGroupSerializer(serializers.ModelSerializer):
    options = serializers.JSONField(read_only=True)
    ads = AdGroupAdSerializer(many=True, read_only=True)

    def validate_name(self, value):
        if value in self.context.get("request").user.ad_groups.values_list(
            "name", flat=True
        ):
            raise ValidationError("Ad Group must have a unqiue name.")

        return value

    class Meta:
        model = AdGroup
        fields = ["name", "options", "pk", "ads"]


class ArchiveAdModelSerializer(serializers.ModelSerializer):
    pk = serializers.ReadOnlyField()
    created_by = PublicUserSerializer(allow_null=True)
    condition_display = serializers.CharField(source="get_condition_display")
    return_policy_display = serializers.CharField(source="get_return_policy_display")
    specifications = serializers.ListField()
    images = serializers.JSONField()

    class Meta:
        model = Ad
        fields = [
            "title",
            "price",
            "shipping",
            "return_policy",
            "condition",
            "created_by",
            "images",
            "specifications",
            "pk",
            "condition_display",
            "return_policy_display",
        ]


class PublicAdModelSerializer(serializers.ModelSerializer):
    pk = serializers.ReadOnlyField()
    created_by = PublicUserSerializer(allow_null=True)
    date_created = serializers.DateTimeField(format="%Y.%m.%d", read_only=True)
    latest_push_date = serializers.DateTimeField(
        format="%Y.%m.%d %H:%M:%S", read_only=True
    )
    expiry_date = serializers.DateTimeField(format="%Y.%m.%d", read_only=True)
    condition = serializers.CharField(source="get_condition_display")
    return_policy = serializers.CharField(source="get_return_policy_display")
    highlight = serializers.SerializerMethodField()
    top = serializers.SerializerMethodField()
    gallery = serializers.SerializerMethodField()
    images = serializers.JSONField()
    specifications = serializers.ListField()
    group_data = AdGroupSerializer(source="group")

    def create(self, validated_data):
        raise ValidationError("Read-only serializer")

    def update(self, instance, validated_data):
        raise ValidationError("Read-only serializer")

    def get_highlight(self, obj):
        return obj.is_highlight()

    def get_top(self, obj):
        return obj.is_top()

    def get_gallery(self, obj):
        return obj.is_gallery()

    class Meta:
        model = Ad
        fields = [
            "title",
            "description",
            "price",
            "shipping",
            "return_policy",
            "condition",
            "available",
            "unlisted",
            "category",
            "created_by",
            "images",
            "group",
            "group_data",
            "specifications",
            "date_created",
            "expiry_date",
            "latest_push_date",
            "highlight",
            "top",
            "gallery",
            "pk",
        ]


class AdModelSerializer(serializers.ModelSerializer):
    pk = serializers.ReadOnlyField(source="id")
    created_by = PublicUserSerializer(required=False, allow_null=True)
    date_created = serializers.DateTimeField(
        format="%Y.%m.%d", required=False, read_only=True
    )
    latest_push_date = serializers.DateTimeField(
        format="%Y.%m.%d %H:%M:%S", required=False, read_only=True
    )
    expiry_date = serializers.DateTimeField(
        format="%Y.%m.%d", required=False, read_only=True
    )
    highlight = serializers.SerializerMethodField()
    top = serializers.SerializerMethodField()
    gallery = serializers.SerializerMethodField()
    images = serializers.JSONField(required=True)
    specifications = serializers.ListField(required=False, write_only=True)
    specifications_json = serializers.JSONField(
        required=False, read_only=True, source="specifications"
    )
    group_data = AdGroupSerializer(read_only=True, source="group")
    condition_display = serializers.CharField(
        source="get_condition_display", read_only=True
    )
    return_policy_display = serializers.CharField(
        source="get_return_policy_display", read_only=True
    )

    def validate_specifications(self, value):
        specifications = {}

        for field in value:
            field_object = json.loads(field)
            key, value = field_object
            key = key.strip()
            value = value.strip()
            if len(key) == 0 and len(value) == 0:
                continue

            if not self.is_valid_specification_key(key):
                raise ValidationError(
                    f"'{key}' cannot be used as name for specification field. Field name must be alphanumeric (spaces and hypens allowed), at least 1 character long."
                )

            if not self.is_valid_specification_value(value):
                raise ValidationError(
                    f"'{value}' cannot be used as value for specification field. Field value must be alphanumeric (spaces and hypens allowed), at least 1 character long."
                )

            if key in specifications.keys():
                raise ValidationError(
                    f"The '{key}' specification field can only appear once. Please review and ensure that each specification is unique."
                )

            specifications[key] = value

        return specifications

    def validate(self, data):
        group = data.get("group")
        if group:
            specifications = data["specifications"]
            ad_matching_specifications = group.ads.filter(
                specifications=specifications
            ).first()
            if (
                ad_matching_specifications
                and ad_matching_specifications != self.instance
            ):
                raise ValidationError(
                    {
                        "specifications": f"Ad with these specifications already exists in group '{group.name}'"
                    }
                )

        return data

    class Meta:
        model = Ad
        fields = [
            "title",
            "description",
            "price",
            "shipping",
            "return_policy",
            "condition",
            "available",
            "unlisted",
            "category",
            "created_by",
            "images",
            "group",
            "group_data",
            "specifications",
            "specifications_json",
            "date_created",
            "expiry_date",
            "latest_push_date",
            "highlight",
            "top",
            "gallery",
            "pk",
            "condition_display",
            "return_policy_display",
        ]

    def validate_images(self, value):
        file_name_list = value[:]
        storage = FileSystemStorage(MEDIA_ROOT)
        for file_name in file_name_list:
            if not storage.exists(file_name):
                file_name_list.remove(file_name)

        if len(file_name_list) == 0:
            raise ValidationError("Must attach at least one image.")

        return file_name_list

    def get_highlight(self, obj):
        return obj.is_highlight()

    def get_top(self, obj):
        return obj.is_top()

    def get_gallery(self, obj):
        return obj.is_gallery()

    def is_valid_specification_key(self, input_string):
        pattern = re.compile(r"^[a-zA-Z0-9\s-]{1,}$")
        return bool(pattern.match(input_string))

    def is_valid_specification_value(self, input_string):
        pattern = re.compile(r"^[a-zA-Z0-9\s-]{1,}$")
        return bool(pattern.match(input_string))


class AdBoostSerializer(serializers.Serializer):
    boosts = serializers.MultipleChoiceField(
        choices=[
            ("push_ad", "Push Ad"),
            ("highlight_ad", "Highlight Ad"),
            ("top_ad", "Top Ad"),
            ("gallery_ad", "Gallery Ad"),
        ]
    )

    class Meta:
        fields = ["boosts"]

    def validate_boosts(self, value):
        ad = self.context.get("ad")
        for boost in value:
            if boost == "highlight_ad" and ad.is_highlight():
                raise ValidationError(
                    f"Cannot use highlight boost until {ad.highlight_expiry.strftime('%d.%m.%Y %H:%M:%S')}."
                )
            elif boost == "top_ad" and ad.is_top():
                raise ValidationError(
                    f"Cannot use top boost until {ad.top_expiry.strftime('%d.%m.%Y %H:%M:%S')}."
                )
            elif boost == "gallery_ad" and ad.is_gallery():
                raise ValidationError(
                    f"Cannot use gallery boost until {ad.gallery_expiry.strftime('%d.%m.%Y %H:%M:%S')}."
                )

        if self.context.get("request").user != ad.created_by:
            raise ValidationError("Ad can only be boosted by the ad owner.")

        if self.context.get("payer_bank_account").user != ad.created_by:
            raise ValidationError("Bank account must be owner by the ad owner.")

        boost_cost = sum([FeeTransaction.AMOUNT_MAP[boost] for boost in value])
        # validate that bank can cover the cost (?)

        return value


class CartAdSerializer(serializers.ModelSerializer):
    created_by = PublicUserSerializer(read_only=True)
    condition_display = serializers.CharField(source="get_condition_display")
    return_policy_display = serializers.CharField(source="get_return_policy_display")

    class Meta:
        model = Ad
        fields = [
            "title",
            "price",
            "condition",
            "shipping",
            "return_policy",
            "created_by",
            "images",
            "available",
            "unlisted",
            "condition_display",
            "return_policy_display",
            "pk",
        ]


class CartItemSerializer(serializers.ModelSerializer):
    ad = CartAdSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ["amount", "ad", "pk"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["items"]


class CheckoutCartAdSerializer(serializers.Serializer):
    pk = serializers.IntegerField(write_only=True)
    price = serializers.FloatField(min_value=0)
    title = serializers.CharField(min_length=1)
    unlisted = serializers.BooleanField(required=False)
    shipping = serializers.FloatField(min_value=0)
    condition = serializers.ChoiceField(choices=Ad.CONDITIONS, allow_blank=True)

    def validate_unlisted(self, value):
        if value:
            raise serializers.ValidationError("Ad has been unlisted.")
        return value

    def validate(self, data):
        ad = Ad.objects.get(pk=data['pk'])
        errors = {}

        for field, value in data.items():
            db_value = getattr(ad, field)
            if db_value != value:
                errors[field] = f'{field} changed from {value} to {db_value}'

        if errors:
            raise serializers.ValidationError(errors)

        return data


class CheckoutItemSerializer(serializers.Serializer):
    pk = serializers.IntegerField(write_only=True)
    amount = serializers.IntegerField(min_value=1)
    ad = CheckoutCartAdSerializer()

    def validate(self, data):
        amount = data.get('amount')
        errors = defaultdict(list)
        request = self.context.get("request")

        if not request:
            raise ValidationError("Request context is missing.")

        item = CartItem.objects.get(pk=data['pk'])
        if amount and amount > item.ad.available:
            errors['amount'].append('Amount cannot be larger than available.')

        if item.ad.created_by == request.user:
            errors['buyer'].append('Buyer cannot be the ad creator.')

        if errors:
            raise serializers.ValidationError(errors)

        return data


class CheckoutSerializer(serializers.Serializer):
    shipping_address = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all())
    bank_account = serializers.PrimaryKeyRelatedField(queryset=BankAccount.objects.all())
    items = serializers.ListField()

    def validate_shipping_address(self, value):
        request = self.context.get("request")
        
        if value.user != request.user:
            raise ValidationError("Buyer must be shipping address owner.")
        
        return value
    
    def validate_bank_account(self, value):
        request = self.context.get("request")
        
        if value.user != request.user:
            raise ValidationError("Buyer must be bank account owner.")
        
        return value

    def validate_items(self, value):
        items = value.copy()
        errors = defaultdict(list)
        request = self.context.get("request")
        
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
            item_serializer = CheckoutItemSerializer(data=item, context=self.context)
            if not item_serializer.is_valid():
                item_errors.update(item_serializer.errors)

            if item_errors:
                errors[item["pk"]] = item_errors

        if errors:
            raise ValidationError(dict(errors))
        
        return valid_items
    
    def create(self, validated_data):
        items = validated_data['items']
        bank_account = validated_data['bank_account']
        shipping_address = validated_data['shipping_address']
        user = self.context['request'].user
        orders = []

        for item in items:
            cart_item = CartItem.objects.get(pk=item['pk'])
            amount = item['amount']
            order = Order.objects.create(
                bank_account=bank_account, 
                shipping_address=shipping_address,
                amount=amount,
                ad=cart_item.ad,
                buyer=user,
                seller=cart_item.ad.created_by,
                status='pending_payment',
            )
            orders.append(order)
            cart_item.delete()
    
        return {
            'items': items,
            'bank_account': bank_account,
            'shipping_address': shipping_address,
        }

    class Meta:
        fields = [
            "shipping_address",
            "bank_account",
            "items",
        ]


class OrderSerializer(serializers.ModelSerializer):
    buyer = serializers.JSONField(source='archive.buyer')
    seller = serializers.JSONField(source='archive.seller')
    shipping_address = serializers.JSONField(source='archive.shipping_address')
    bank_account = serializers.JSONField(source='archive.bank_account')
    ad = serializers.JSONField(source='archive.ad')
    total = serializers.FloatField()
    date_created = serializers.DateTimeField(
        format="%Y.%m.%d", read_only=True
    )
    return_date_expiry = serializers.DateTimeField(
        format="%Y.%m.%d %H:%M:%S", read_only=True
    )
    status_display = serializers.CharField(source='get_status_display') 
    tracking_number = serializers.CharField()

    class Meta:
        model = Order
        fields = [
            'pk',
            'status',
            'status_display',
            'total',
            'buyer',
            'seller',
            'shipping_address',
            'bank_account',
            'amount',
            'ad',
            'date_created',
            'return_date_expiry',
            'tracking_number',
        ]


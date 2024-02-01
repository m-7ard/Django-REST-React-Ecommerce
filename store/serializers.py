import json
import re

from django.core.files.storage import FileSystemStorage
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from Django_REST_ecommerce.settings import MEDIA_ROOT
from .models import Category, Ad, Cart, CartItem, AdGroup, Order, OrderItem
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
    condition = serializers.CharField(source="get_condition_display")
    images = serializers.JSONField()
    return_policy = serializers.CharField(source="get_return_policy_display")
    specifications = serializers.ListField()

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
        ]



class PublicAdModelSerializer(serializers.ModelSerializer):
    pk = serializers.ReadOnlyField(source="pk")
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
    condition_display = serializers.CharField(source="get_condition_display", read_only=True)
    return_policy_display = serializers.CharField(source="get_return_policy_display", read_only=True)

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



class OrderItemSerializer(serializers.ModelSerializer):
    ad_archive = serializers.JSONField(read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'order',
            'ad',
            'amount',
            'ad_archive'    
        ]


class OrderSerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(required=False, queryset=CustomUser.objects.all())
    archive = serializers.JSONField(read_only=True)
    items = OrderItemSerializer(many=True, required=False, read_only=True)
    status = serializers.CharField(default='pending_payment')
    shipping_address = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all())
    bank_account = serializers.PrimaryKeyRelatedField(queryset=BankAccount.objects.all())

    class Meta:
        model = Order
        fields = [
            'buyer',
            'shipping_address',
            'bank_account',
            'status',
            'archive', 
            'items'
        ]
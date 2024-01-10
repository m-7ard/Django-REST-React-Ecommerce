from django.core.files.storage import FileSystemStorage
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from Django_REST_ecommerce.settings import MEDIA_ROOT
from .models import Category, Ad
from users.models import FeeTransaction
from users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
    )

    class Meta:
        model = Category
        fields = ["pk", "name", "parent"]


class AdModelSerializer(serializers.ModelSerializer):
    images = serializers.JSONField()
    created_by = UserSerializer(required=False, allow_null=True)
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

    condition_display = serializers.CharField(source="get_condition_display", read_only=True)
    return_policy_display = serializers.CharField(source="get_return_policy_display", read_only=True)
    pk = serializers.ReadOnlyField(source="id")

    class Meta:
        model = Ad
        fields = "__all__"
        read_only_fields = ["pk", "latest_push_date", "date_created"]
        extra_fields = ["pk", "condition_display", "return_policy_display"]

    def validate_images(self, value):
        file_name_list = value[:]
        storage = FileSystemStorage(MEDIA_ROOT)
        for file_name in file_name_list:
            if not storage.exists(file_name):
                file_name_list.remove(file_name)

        return file_name_list

    def get_highlight(self, obj):
        return obj.is_highlight()

    def get_top(self, obj):
        return obj.is_top()

    def get_gallery(self, obj):
        return obj.is_gallery()


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

        boost_cost = sum([FeeTransaction.AMOUNT_MAP[boost] for boost in value])
        if boost_cost > self.context.get("request").user.funds:
            raise ValidationError("User funds are not enough to cover the boosts.")

        return value

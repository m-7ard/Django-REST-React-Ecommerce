from django.core.files.storage import FileSystemStorage
from rest_framework import serializers

from Django_REST_ecommerce.settings import MEDIA_ROOT
from .models import Category, Ad
from users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
    )

    class Meta:
        model = Category
        fields = ['pk', 'name', 'parent']


class AdModelSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.CharField()
    )
    created_by = UserSerializer(required=False, allow_null=True)

    class Meta:
        model = Ad
        fields = ['pk', 'title', 'description', 'price', 'category', 'created_by', 'date_created', 'images']
        read_only_fields = ['pk', 'date_created']

    def validate_images(self, value):
        file_name_list = value[:]
        storage = FileSystemStorage(MEDIA_ROOT)
        for file_name in file_name_list:
            if not storage.exists(file_name):
                file_name_list.remove(file_name)
        
        return file_name_list
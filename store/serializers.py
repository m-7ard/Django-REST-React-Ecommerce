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
    date_created = serializers.DateTimeField(format="%Y.%m.%d", required=False, read_only=True)
    latest_push_date = serializers.DateTimeField(format="%Y.%m.%d %H:%M:%S", required=False, read_only=True)
    expiry_date = serializers.DateTimeField(format="%Y.%m.%d", required=False, read_only=True)
    highlight = serializers.SerializerMethodField()

    class Meta:
        model = Ad
        fields = [
            'pk', 
            'title', 
            'description',
            'price', 
            'category', 
            'created_by', 
            'images',
            'date_created',
            'latest_push_date',
            'highlight',
            'expiry_date',
        ]
        read_only_fields = [
            'pk', 
            'latest_push_date', 
            'date_created'
        ]

    def validate_images(self, value):
        file_name_list = value[:]
        storage = FileSystemStorage(MEDIA_ROOT)
        for file_name in file_name_list:
            if not storage.exists(file_name):
                file_name_list.remove(file_name)
        
        return file_name_list
    
    def get_highlight(self, obj):
        return obj.is_highlight()
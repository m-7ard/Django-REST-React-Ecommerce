from rest_framework import serializers

from .models import Category, Ad


class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
    )

    class Meta:
        model = Category
        fields = ['pk', 'name', 'parent']


class AdModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ad
        fields = ['pk', 'title', 'description', 'price', 'category', 'created_by', 'date_created']
        read_only_fields = ['pk', 'date_created']
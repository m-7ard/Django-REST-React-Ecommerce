from rest_framework import serializers

from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
    )

    def to_representation(self, instance):
        def get_subcategories(category):
            subcategories = Category.objects.filter(parent=category)
            if subcategories:
                return CategorySerializer(subcategories, many=True).data
            return []

        data = super().to_representation(instance)
        data['subcategories'] = get_subcategories(instance)
        return data

    class Meta:
        model = Category
        fields = ('pk', 'name', 'parent', 'subcategories')
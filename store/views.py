from typing import Any
from django.views.generic import TemplateView, DetailView, CreateView, UpdateView, FormView, DeleteView, View, ListView
from rest_framework import viewsets

from .models import Category
from .serializers import CategorySerializer

class FrontpageView(TemplateView):
    template_name = 'store/frontpage.html'

    def get_context_data(self, **kwargs: Any):
        context = super().get_context_data(**kwargs)
        context['categories'] = [{
            'pk': category.pk,
            'name': category.name,
            'parent': getattr(category.parent, 'pk', None)
        } for category in Category.objects.all()]
        
        return context
    
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

    def perform_create(self, serializer):
        # ensure current user is correctly populated on new objects
        serializer.save(user=self.request.user)

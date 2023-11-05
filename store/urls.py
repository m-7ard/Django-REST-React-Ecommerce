from django.urls import path
from rest_framework import routers

from . import views


urlpatterns = [
    path('', views.FrontpageView.as_view(), name='frontpage'),
]

router = routers.DefaultRouter()
router.register('api/categories', views.CategoryViewSet, basename='category')

urlpatterns += router.urls
from django.urls import path
from rest_framework import routers

from . import views


"""
from django.urls import get_resolver 
patterns = get_resolver().url_patterns
for pattern in patterns:
    try:
        for p in pattern.url_patterns:
        
            print(p)
    except:
        print(pattern)

Use this to list all urls and resolvers
"""

urlpatterns = [
    path('validate_ad_images/', views.AdImageFieldUploadView.as_view())
]

router = routers.DefaultRouter()
router.register('api/categories', views.CategoryViewSet, basename='category')
router.register('api/ads', views.AdViewSet, basename='ad')

urlpatterns += router.urls
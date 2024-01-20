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
    path("api/validate_image/", views.AdImageFieldUploadView.as_view()),
    path("api/frontpage_data/", views.FrontpageApiView.as_view()),
    path("api/list_user_ads/<int:pk>/", views.ListUserAds.as_view()),
    path("api/list_user_ads/", views.ListUserAds.as_view(), kwargs={"pk": None}),
    path("api/confirm_checkout/", views.ConfirmCheckoutAPIView.as_view()),
]

router = routers.DefaultRouter()
router.register("api/ads", views.AdViewSet, basename="ad")
router.register("api/categories", views.CategoryViewSet, basename="category")
router.register("api/ad-groups", views.AdGroupViewSet, basename="ad-group")

urlpatterns += router.urls

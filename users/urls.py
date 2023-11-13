from django.urls import path, include
from rest_framework import routers

from . import views

urlpatterns = [
    path('api/login/', views.LoginView.as_view(), name='login'),
    path('api/logout/', views.LogoutView.as_view(), name='logout'),
    path('api/user/', views.CurrentUser.as_view()),
]

router = routers.DefaultRouter()
router.register('api/register', views.UserRegisterAPIView, basename='register')

urlpatterns += router.urls
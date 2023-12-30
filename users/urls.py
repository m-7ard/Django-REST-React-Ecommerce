from django.urls import path, include
from rest_framework import routers

from . import views

urlpatterns = [
    path('api/login/', views.LoginView.as_view(), name='login'),
    path('api/logout/', views.LogoutView.as_view(), name='logout'),
    path('api/user/', views.CurrentUser.as_view()),
    path(
        'api/deposit/', 
        views.BankTransactionCreateAPIView.as_view(), 
        name='deposit', 
        kwargs={'kind': 'deposit'}
    ),
    path(
        'api/withdraw/', 
        views.BankTransactionCreateAPIView.as_view(), 
        name='withdraw',
        kwargs={'kind': 'withdrawal'}
    ),
]

router = routers.DefaultRouter()
router.register('api/register', views.UserRegisterAPIView, basename='register')
router.register('api/bank-accounts', views.BankAccountViewset, basename='bank-account')
router.register('api/addresses', views.AddressViewset, basename='address'),
router.register('api/transactions', views.TransactionGenericViewSet, basename='transaction'),

urlpatterns += router.urls
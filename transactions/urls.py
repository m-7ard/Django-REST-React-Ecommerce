from django.urls import path
from rest_framework import routers

from . import views


urlpatterns = [
    path("api/list_user_transactions/", views.ListUserTransactions.as_view()),

]

router = routers.DefaultRouter()
# router.register("api/", views., basename="")
# urlpatterns += router.urls

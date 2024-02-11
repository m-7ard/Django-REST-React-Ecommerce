from django.contrib import admin
from django.urls import path, include, re_path
from django.conf.urls.static import static

from . import settings
from store.views import IndexView


urlpatterns = [
    path('silk/', include('silk.urls', namespace='silk')),
    path('admin/', admin.site.urls),
    path('', IndexView.as_view()),
    path('', include('store.urls')),
    path('', include('users.urls')),
    path('', include('transactions.urls')),
    re_path(r"^(?!api/|media/).*", IndexView.as_view(), name='index'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

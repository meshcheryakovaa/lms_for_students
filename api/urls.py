# api/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LessonEntryViewSet

router = DefaultRouter()
router.register('entries', LessonEntryViewSet, basename='entries')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('djoser.urls.authtoken')),
    path('', include('djoser.urls')),
]

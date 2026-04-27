# api/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import GroupViewSet, LessonEntryViewSet, UserViewSet

router = DefaultRouter()
router.register('groups', GroupViewSet, basename='groups')
router.register('users', UserViewSet, basename='users')
router.register('entries', LessonEntryViewSet, basename='entries')

urlpatterns = [
    path('', include(router.urls)),
]

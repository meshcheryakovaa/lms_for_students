from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LessonEntryViewSet, UserViewSet

router = DefaultRouter()
router.register('users', UserViewSet, basename='users')
router.register('entries', LessonEntryViewSet, basename='entries')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('djoser.urls.authtoken')),
]

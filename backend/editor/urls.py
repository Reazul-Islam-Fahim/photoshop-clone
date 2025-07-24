
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ImageViewSet, LayerViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'images', ImageViewSet)
router.register(r'layers', LayerViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

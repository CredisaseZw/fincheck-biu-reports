from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import CompanyShareHoldersViewSet

router = SimpleRouter()
router.register(r"shareholdings", CompanyShareHoldersViewSet, basename="shareholdings")

urlpatterns = [
    path("", include(router.urls)),
]
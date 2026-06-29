from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import CompanyShareHoldersViewSet

router = SimpleRouter()
router.register(r"shareholders", CompanyShareHoldersViewSet, basename="shareholders")

urlpatterns = [
    path("", include(router.urls)),
]
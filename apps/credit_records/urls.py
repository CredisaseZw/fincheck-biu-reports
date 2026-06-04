from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CreditRecordsViewSet

router = DefaultRouter()
router.register(r"credit-records", CreditRecordsViewSet, basename="credit-records")

urlpatterns = [
    path("api/", include(router.urls)),
]

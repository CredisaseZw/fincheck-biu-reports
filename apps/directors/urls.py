from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import DirectorsViewSet, CompanyDirectorViewSet

router = SimpleRouter()
router.register(r"companies", DirectorsViewSet, basename="companies")
router.register(r"directors", CompanyDirectorViewSet, basename="directors")

urlpatterns = [
    path("", include(router.urls)),
]
from rest_framework.routers import DefaultRouter
from .views import CompaniesViewSet

router = DefaultRouter()
router.register(r"companies", CompaniesViewSet, basename="companies")

urlpatterns = router.urls
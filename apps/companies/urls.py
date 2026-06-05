from rest_framework.routers import SimpleRouter
from .views import CompaniesViewSet

router = SimpleRouter()
router.register(r"companies", CompaniesViewSet, basename="companies")

urlpatterns = router.urls
from rest_framework.routers import SimpleRouter
from .views import CompaniesViewSet,TokenFreeCompanyQueryViewSet

router = SimpleRouter()
router.register(r"companies", CompaniesViewSet, basename="companies")
router.register(r"retrieve-company", TokenFreeCompanyQueryViewSet, basename='retrieve-company')
urlpatterns = router.urls
from rest_framework.routers import SimpleRouter
from .views import FinancialsViewSet

router = SimpleRouter()
router.register(r"financials", FinancialsViewSet, basename="financials")

urlpatterns = router.urls


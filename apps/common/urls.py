from rest_framework.routers import SimpleRouter
from .views import FinancialsViewSet, DeleteTradeReferenceViewSet

router = SimpleRouter()
router.register(r"financials", FinancialsViewSet, basename="financials")
router.register(r"trade_references", DeleteTradeReferenceViewSet, basename="trade_references")

urlpatterns = router.urls

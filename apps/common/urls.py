from rest_framework.routers import SimpleRouter
from .views import FinancialsViewSet, DeleteTradeReferenceViewSet, DeleteBankerAccounts

router = SimpleRouter()
router.register(r"financials", FinancialsViewSet, basename="financials")
router.register(r"trade_references", DeleteTradeReferenceViewSet, basename="trade_references")
router.register(r"bankers_accounts", DeleteBankerAccounts, basename="bankers_accounts")

urlpatterns = router.urls

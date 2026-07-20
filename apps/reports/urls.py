from rest_framework.routers import SimpleRouter
from .views import ReportViewSet, ArchivedReportsViewSet, DashboardStats
from django.urls import path,include

router = SimpleRouter()
router.register(r"reports", ReportViewSet, basename="reports")
router.register(r"archived-reports", ArchivedReportsViewSet, basename="archived-reports")
router.register(r"dashboard-stats", DashboardStats, basename="dashboard-stats")

urlpatterns = [
    path("", include(router.urls)),
]
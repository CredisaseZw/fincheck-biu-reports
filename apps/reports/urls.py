from rest_framework.routers import SimpleRouter
from .views import (
    ReportViewSet, 
    ArchivedReportsViewSet, 
    DashboardStats, 
    BizSafeReports,
    ClientMonthlyStats)
from django.urls import path,include


router = SimpleRouter()
router.register(r"reports", ReportViewSet, basename="reports")
router.register(r"archived-reports", ArchivedReportsViewSet, basename="archived-reports")
router.register(r"dashboard-stats", DashboardStats, basename="dashboard-stats")
router.register(r"client-monthly", ClientMonthlyStats, basename="client-monthly")
router.register(r"bizsafe-reports",BizSafeReports, basename="bizsafe-reports")

urlpatterns = [
    path("", include(router.urls)),
]
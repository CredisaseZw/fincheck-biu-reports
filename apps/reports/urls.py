from rest_framework.routers import SimpleRouter
from .views import ReportViewSet, ArchivedReportsViewSet
from django.urls import path,include

router = SimpleRouter()
router.register(r"reports", ReportViewSet, basename="reports")
router.register(r"archived-reports", ArchivedReportsViewSet, basename="archived-reports")

urlpatterns = [
    path("", include(router.urls)),
]
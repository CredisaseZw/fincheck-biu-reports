from rest_framework.routers import SimpleRouter
from .views import ReportViewSet
from django.urls import path,include

router = SimpleRouter()
router.register(r"reports", ReportViewSet, basename="reports")

urlpatterns = [
    path("", include(router.urls)),
]
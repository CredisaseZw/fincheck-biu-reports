from rest_framework.mixins import DestroyModelMixin
from rest_framework.viewsets import GenericViewSet
from .models import Shareholder

# Create your views here.
class CompanyShareHoldersViewSet(
        GenericViewSet,
       DestroyModelMixin
    ):
    queryset = Shareholder.objects.all()
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import DestroyModelMixin
from apps.utils.permissions import IsStaffUser
from .models import CompanyDirector
from .serializers import DirectorSerializer

class CompanyDirectorViewSet(DestroyModelMixin, GenericViewSet):
    queryset = CompanyDirector.objects.all()
    serializer_class = DirectorSerializer
    permission_classes = [IsStaffUser]


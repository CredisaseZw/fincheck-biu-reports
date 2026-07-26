from .models import Individuals
from .serializers import (
    IndividualSerializer,
    IndividualListSerializer,
    IndividualCreateSerializer,
    ClientIndividualSerializer,
    IndividualUpdateSerializer,
)
from apps.users.models import User
from rest_framework.response import Response
from rest_framework import status as STATUS 
from apps.utils.base_viewset import BaseAuthJSONViewSet
import logging

logger = logging.getLogger(__name__)

# Create your views here.
class IndividualsViewSet(BaseAuthJSONViewSet):
    """
    A viewset for viewing and editing individual instances.
    """
    
    queryset = Individuals.objects.prefetch_related(
        "claims",
        "absconders",
        "court_judgements",
        "insolvency_records",
        "public_information",
        "banker_accounts",
        "trade_references",
        "financials",
        "registration_accounts",
        "professional_partners",
    ).select_related(
        "employment_information",
        "next_of_kin"
    ).filter(is_deleted = False)

    serializer_class = IndividualSerializer
    search_fields = ["full_name", "national_id", "email"]

    def get_serializer_class(self):
        if self.action == "list":
            return IndividualListSerializer
        elif self.action == "create":
            return IndividualCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return IndividualUpdateSerializer

        if self.request.user.is_staff:
            return IndividualSerializer
        return ClientIndividualSerializer
    
    def create(self, request, *args, **kwargs):
        user:User = request.user
        if not user.is_staff:
            return Response({
                "error" : "Access error."
            }, status=STATUS.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user:User = request.user
        if not user.is_staff:
            return Response({
                "error" : "Access error."
            }, status=STATUS.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        user:User = request.user
        if not user.is_staff:
            return Response({
                "error" : "Access error."
            }, status=STATUS.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user:User = request.user
        if not user.is_staff:
            return Response({
                "error" : "Access error."
            }, status=STATUS.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

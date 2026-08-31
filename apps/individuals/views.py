from .models import Individuals
from .serializers import (
    IndividualSerializer,
    IndividualListSerializer,
    IndividualCreateSerializer,
    ClientIndividualSerializer,
    IndividualUpdateSerializer,
)
from django.db.models import ProtectedError
from django_filters.rest_framework import DjangoFilterBackend
from apps.utils.filters import IndividualSearchFilter
from apps.users.models import User
from rest_framework.response import Response
from rest_framework import status as STATUS 
from apps.utils.base_viewset import BaseAuthJSONViewSet
from rest_framework.decorators import action
from apps.utils.entity_lookup import EntityLookUp
import logging

entity = EntityLookUp()
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
    filter_backends = [DjangoFilterBackend]
    filterset_class = IndividualSearchFilter
    serializer_class = IndividualSerializer

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
        user: User = request.user
        if not user.is_staff:
            return Response({
                "error": "Access error."
            }, status=STATUS.HTTP_403_FORBIDDEN)

        instance = self.get_object()
        try:
            instance.delete()
        except ProtectedError as e:
            return Response({
                "error": str(e)
            }, status=STATUS.HTTP_400_BAD_REQUEST)

        return Response(status=STATUS.HTTP_204_NO_CONTENT)
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

    @action(detail=False, methods=["get"], url_path="lookup")
    def _lookup_individual(self, request, *args, **kwargs):
        national_id = request.query_params.get("national_id", None)

        if not national_id:
            return Response(
                {"error": "Missing national_id parameter."},
                status=STATUS.HTTP_400_BAD_REQUEST
            )

        individual = None
        search_value = Individuals.normalize_national_id(national_id)
        individual = Individuals.objects.filter(
            national_id=search_value
        ).first()

        if not individual:
            instance = entity.entity_look_up(type="individual", value=search_value)
            if instance:
                individual = instance
        
        if not individual:
            return Response(
                {"error": "Individual not found."},
                status=STATUS.HTTP_404_NOT_FOUND
            )
            
        serializer = IndividualSerializer(individual)
        return Response(serializer.data, status=STATUS.HTTP_200_OK)
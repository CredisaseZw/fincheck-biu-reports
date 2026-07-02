from .models import Individuals
from .serializers import (
    IndividualSerializer,
    IndividualListSerializer,
    IndividualCreateSerializer,
    IndividualUpdateSerializer,
)
from apps.utils.base_viewset import BaseJSONViewSet
import logging

logger = logging.getLogger(__name__)

# Create your views here.
class IndividualsViewSet(BaseJSONViewSet):
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
        return super().get_serializer_class()
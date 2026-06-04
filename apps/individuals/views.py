from .models import Individuals
from .serializers import (
    IndividualSerializer,
    IndividualListSerializer,
    IndividualCreateSerializer,
    IndividualUpdateSerializer,
)
from apps.utils.base_viewset import BaseJSONViewSet
# Create your views here.
class IndividualsViewSet(BaseJSONViewSet):
    """
    A viewset for viewing and editing individual instances.
    """
    queryset = Individuals.objects.all()
    serializer_class = IndividualSerializer

    def get_serializer_class(self):
        if self.action == "list":
            return IndividualListSerializer
        elif self.action == "create":
            return IndividualCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return IndividualUpdateSerializer
        return super().get_serializer_class()
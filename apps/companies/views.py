from apps.utils.base_viewset import BaseJSONViewSet
from .models import (
    Company
)
from .serializers import (
    CompanyCreateSerializer,
    CompanyListSerializer,
    CompanySerializer,
    CompanyUpdateSerializer
)

class CompaniesViewSet(BaseJSONViewSet):
    filterset_fields = ["refer_type"]
    search_fields = ["registered_name", "trading_name"]   
    ordering_fields = ["created_at", "registered_name", "trading_name"]

    serializer_class = CompanySerializer
    queryset = Company.objects.select_related(
        "structure",
        "operations",
        "overview"    
    ).filter(is_deleted = False)
    
    def get_serializer_class(self):
        if self.action == "list":
            return CompanyListSerializer
        elif self.action == "create":
            return CompanyCreateSerializer
        elif self.action in [ "update", "partial_update"]:
            return CompanyUpdateSerializer
        return CompanySerializer
from rest_framework.decorators import action
from apps.utils.helpers import validate_serializer 
from rest_framework import status as STATUS
from rest_framework.response import Response
from apps.utils.base_viewset import BaseJSONViewSet
from .models import (
    Company
)
from .serializers import (
    CompanyWriteSerializer,
    CompanyCreateSerializer,
    CompanyListSerializer,
    CompanySerializer,

    CompanyOperationsCreateSerializer,
    CompanyOperationsSerializer,
    CompanyOverviewSerializer,
    CompanyStructureCreateSerializer,
    CompanyStructureSerializer
)
# Create your views here.

class CompaniesViewSet(BaseJSONViewSet):
    filterset_fields = ["refer_type"]
    search_fields = ["registered_name", "trading_name"]   
    ordering_fields = ["created_at", "registered_name", "trading_name"]

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
            return CompanyWriteSerializer
        return CompanySerializer
    
    
    # COMPANY OVERVIEW UPDATE
    @action(detail=True, url_path="update-overview", methods=["patch"])
    def update_overview(self, request, *args, **kwargs):
        company = self.get_object()
        serializer = CompanyOverviewSerializer(
            company.overview,
            data=request.data,
            partial=True,
            context={"request": request}
        )
        error = validate_serializer(serializer)
        if error:
            return error

        overview = serializer.save()
        return Response(CompanyOverviewSerializer(overview).data, status=STATUS.HTTP_200_OK)
    

    @action(detail=True, url_path="structure", methods=["POST", "PATCH"])
    def update_structure(self, request, *args, **kwargs):
        company = self.get_object()

        if hasattr(company, "structure"): # RUN UPDATE
            serializer =  CompanyStructureCreateSerializer(
                company.structure,
                data = request.data,
                partial =True,
                context = {'request': request}
            )        
            error = validate_serializer(serializer=serializer)
            if error:
                return error    

            structure = serializer.save()
            return Response(CompanyStructureSerializer(structure).data,
                status=STATUS.HTTP_200_OK
            )

        # CREATE STRUCTURE
        data = request.data.copy()
        data['company'] = company.pk
        
        serializer = CompanyStructureCreateSerializer(data = data)
        error = validate_serializer(serializer=serializer)
        if error:
            return error
        
        structure = serializer.save()
        return Response(CompanyStructureSerializer(structure).data,
            status=STATUS.HTTP_201_CREATED
        )


    @action(detail=True, url_path="operations", methods=["POST", "PATCH"])
    def update_operations(self, request, *args, **kwargs):
        company = self.get_object()
        
        if hasattr(company, "operations"):
            serializer = CompanyOperationsCreateSerializer(
                company.operations,
                data = request.data,
                partial = True,
                context = {'request' : request}
            )
            error = validate_serializer(serializer) 
            if error:
                return error
            
            operations = serializer.save()
            return Response(
                CompanyOperationsSerializer(operations).data,
                status=STATUS.HTTP_200_OK
            )

        data = request.data.copy()
        data['company'] = company.pk

        serializer = CompanyOperationsCreateSerializer(data = data)
        error = validate_serializer(serializer=serializer)
        if error:
            return error
        
        operations = serializer.save()
        return Response(
            CompanyOperationsSerializer(operations).data,
            status=STATUS.HTTP_201_CREATED
        )
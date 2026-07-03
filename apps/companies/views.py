from apps.utils.base_viewset import BaseJSONViewSet
from .models import (
    Company
)
from .serializers import (
    CompanyCreateSerializer,
    CompanyListSerializer,
    CompanySerializer,
    CompanyUpdateSerializer,
)
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status as STATUS
from apps.directors.models import CompanyDirector
from apps.utils.helpers import validate_serializer
from apps.directors.serializers import CompanyDirectorWriteSerializer, CompanyDirectorsSerializer
from rest_framework.decorators import action
from django.db import transaction
from apps.shareholding.models import CompanyShareholding, Shareholder
from apps.shareholding.serializers import (
    CompanyShareholdingWriteSerializer,
    ShareholdingsSerializers,
    ShareholderWriteSerializer
)
import logging

logger = logging.getLogger(__name__)

class CompaniesViewSet(BaseJSONViewSet):
    filterset_fields = ["refer_type"]
    search_fields = ["registered_name", "trading_name", "registration_number"]   
    ordering_fields = ["created_at", "registered_name", "trading_name"]

    serializer_class = CompanySerializer
    queryset = Company.objects.prefetch_related(
        "claims",
        "absconders",
        "court_judgements",
        "insolvency_records",
        "public_information",
        "directors",
        "banker_accounts",
        "trade_references",
        "financials",
        "registration_accounts",
        "professional_partners",
        "updated_by"
    ).select_related(
        "structure",
        "operations",
        "overview",
        "shareholdings"
).filter(is_deleted = False)
    
    def get_serializer_class(self):
        if self.action == "list":
            return CompanyListSerializer
        elif self.action == "create":
            return CompanyCreateSerializer
        elif self.action in [ "update", "partial_update"]:
            return CompanyUpdateSerializer
        return CompanySerializer
    

    @action(detail=True, methods=["POST"], url_path="directors")
    def update_or_create_directors(self, request: Request, *args, **kwargs):
        user = request.user
        company = self.get_object()
        directors = request.data.get("directors", [])

        validated_directors = []
        for d in directors:
            serializer = CompanyDirectorWriteSerializer(data=d)
            error = validate_serializer(serializer=serializer)
            if error:
                logger.error(f"Validation error for director: {serializer.errors}")
                return error
            validated_directors.append((d.get("id"), serializer.validated_data))

        with transaction.atomic():
            for director_id, validated_data in validated_directors:
                validated_data['updated_by'] = user
                if director_id:
                    CompanyDirector.objects.filter(
                        pk=director_id,
                        company=company,
                    ).update(**validated_data)
                else:
                    CompanyDirector.objects.create(
                        company=company,
                        **validated_data,
                    )

        company.refresh_from_db()
        return Response(
            CompanyDirectorsSerializer(instance=company).data,  
            status=STATUS.HTTP_200_OK
        )

    @action(detail=True, methods=["POST"], url_path="shareholders")
    def update_or_create_shareholders(self, request:Request, *args, **kwargs):
        user = request.user
        company = self.get_object()
        data = request.data.copy()
        shareholders = data.pop("shareholders", [])

        with transaction.atomic():
            shareholding = CompanyShareholding.objects.filter(pk=data.get("id")).first()

            if shareholding:
                shareholding_serializer = CompanyShareholdingWriteSerializer(
                    data=data,
                    instance=shareholding,
                    partial=True,
                    context={"request": request}
                )
                error = validate_serializer(serializer=shareholding_serializer)
                if error:
                    return error
                shareholding = self.perform_update(serializer=shareholding_serializer)
            else:
                data["company"] = company.id
                shareholding_serializer = CompanyShareholdingWriteSerializer(data=data)
                error = validate_serializer(serializer=shareholding_serializer)
                if error:
                    return error
                shareholding = self.perform_create(serializer=shareholding_serializer)  

            validated_shareholders = []
            for s in shareholders:
                shareholder_serializer = ShareholderWriteSerializer(data=s)
                error = validate_serializer(serializer=shareholder_serializer)
                if error:
                    return error
                validated_shareholders.append((s.get("id"), shareholder_serializer.validated_data))

            for shareholder_id, validated_data in validated_shareholders:
                validated_data['updated_by'] = user
                if shareholder_id:
                    Shareholder.objects.filter(
                        pk=shareholder_id,
                        shareholding=shareholding,
                    ).update(**validated_data)
                else:
                    Shareholder.objects.create(
                        shareholding=shareholding,
                        **validated_data,
                    )

        read_serializer = ShareholdingsSerializers(shareholding)
        return Response(read_serializer.data, status=STATUS.HTTP_200_OK)
from apps.utils.base_viewset import BaseAuthJSONViewSet
from .models import (
    Company
)
from .serializers import (
    CompanyCreateSerializer,
    CompanyListSerializer,
    CompanySerializer,
    ClientCompanySerializer,
    CompanyUpdateSerializer,
)
from django.db.models import ProtectedError
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status as STATUS
from apps.users.models import User
from apps.directors.models import CompanyDirector
from apps.utils.helpers import validate_serializer
from apps.directors.serializers import CompanyDirectorsSerializer
from apps.individuals.models import Individuals
from apps.individuals.serializers import IndividualDirectorSerializer
from rest_framework.decorators import action
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from apps.utils.filters import CompanySearchFilter
from apps.shareholding.models import CompanyShareholding, Shareholder
from apps.shareholding.serializers import (
    CompanyShareholdingWriteSerializer,
    ShareholdingsSerializers,
    ShareholderWriteSerializer
)
import logging

logger = logging.getLogger(__name__)

class CompaniesViewSet(BaseAuthJSONViewSet):
    filterset_fields = ["refer_type"]
    filter_backends = [ DjangoFilterBackend ]
    filterset_class = CompanySearchFilter
    ordering_fields = ["created_at", "registered_name", "trading_name"]

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
        if self.request.user.is_staff:
            return CompanySerializer
        return ClientCompanySerializer
    
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
    
    @action(detail=True, methods=["POST"], url_path="directors")
    def update_or_create_directors(self, request: Request, *args, **kwargs):
        user: User = request.user
        if not user.is_staff:
            return Response({
                "error": "Access error."
            }, status=STATUS.HTTP_403_FORBIDDEN)

        company = self.get_object()
        directors = request.data.get("directors", [])

        validated_data = []
        for d in directors:
            position = d.pop("position", None)
            if not position:
                logger.error(f"Missing position for director: {d}")
                return Response({
                    "error": "Position is required for each director."
                }, status=STATUS.HTTP_400_BAD_REQUEST)

            individual_id = d.get("id")
            national_id = d.get("national_id")

            director_serializer = IndividualDirectorSerializer(data=d)
            error = validate_serializer(serializer=director_serializer)
            if error:
                logger.error(f"Validation error for director: {d}, Error: {error.data}")
                return error

            i_data = director_serializer.validated_data
            i_data.pop("id", None)

            individual = None
            if individual_id:
                individual = Individuals.objects.filter(pk=individual_id).first()

            if individual is None and national_id:
                individual = Individuals.objects.filter(national_id=national_id).first()

            if individual is None:
                individual = Individuals.objects.create(**i_data)
            else:
                for attr, value in i_data.items():
                    setattr(individual, attr, value)

                individual.save()
            validated_data.append((individual, position))

        with transaction.atomic():
            for individual, position in validated_data:
                CompanyDirector.objects.update_or_create(
                    company=company,
                    individual=individual,
                    defaults={"position": position},
                )

        company.refresh_from_db()
        return Response(
            CompanyDirectorsSerializer(instance=company).data,
            status=STATUS.HTTP_200_OK,
        )

    @action(detail=True, methods=["POST"], url_path="shareholders")
    def update_or_create_shareholders(self, request:Request, *args, **kwargs):
        user:User = request.user
        if not user.is_staff:
            return Response({
                "error" : "Access error."
            }, status=STATUS.HTTP_403_FORBIDDEN)
        
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
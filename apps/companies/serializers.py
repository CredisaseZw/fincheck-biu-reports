from django.db import transaction
from rest_framework import serializers
from apps.companies.models import (
    Company,
    CompanyOperations,
    CompanyOverview,
    CompanyStructure,
)
from apps.common.models import (
    RegistrationAccounts, 
    BankerAccounts, 
    ProfessionalPartners, 
    TradeReferences
)
from apps.common.serializer import (
    RegistrationAccountsSerializer,
    BankerAccountsSerializer,
    ProfessionalPartnersSerializer,
    FinancialsSerializer
)
from apps.common.serializer import (
    RegistrationAccountsSerializer,
    RegistrationAccountsWriteSerializer,
    ProfessionalPartnersSerializer,
    ProfessionalPartnersWriteSerializer,
    TradeReferencesSerializer,
    TradeReferencesWriteSerializer,
    FinancialsSerializer,
    BankerAccountsSerializer,
    BankerAccountsWriteSerializer,
)
from django.contrib.contenttypes.models import ContentType
from apps.directors.serializers import CompanyDirectorSerializer
from apps.shareholding.serializers import ShareholdingsSerializers
# GET OPERATIONS
class CompanyOverviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyOverview
        exclude = [
            "created_at",
            "updated_at",
            "company",
        ]

class CompanyStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyStructure
        fields = [
            'holding_company',
            'subsidiaries',
            'associated_companies',
            'divisions',
            'branches'
        ]

class CompanyOperationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyOperations
        exclude = [
            "created_at",
            "updated_at",
            "company",
        ]
class CompanySerializer(serializers.ModelSerializer):
    overview = CompanyOverviewSerializer(read_only=True)
    structure = CompanyStructureSerializer(read_only=True)
    operations = CompanyOperationsSerializer(read_only=True)
    directors = CompanyDirectorSerializer(many=True, read_only = True)
    shareholdings = ShareholdingsSerializers(read_only = True)
    trade_references = TradeReferencesSerializer(read_only = True, many=True)
    registration_accounts = RegistrationAccountsSerializer(many = True, read_only = True)
    banker_accounts = BankerAccountsSerializer(many = True, read_only = True)
    professional_partners = ProfessionalPartnersSerializer(many = True, read_only = True)
    financials = FinancialsSerializer(many = True, read_only = True)
    company_name = serializers.CharField(read_only=True)
    refer_type = serializers.CharField(source="get_refer_type_display", read_only=True)
    class Meta:
        model = Company
        fields = "__all__"
class CompanyListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(read_only=True)
    refer_type = serializers.CharField(source="get_refer_type_display", read_only=True)
    class Meta:
        model = Company
        fields = [
            "id",
            "company_name",
            "registered_name",
            "trading_name",
            "refer_type",
            "email",
            "telephone_number",
            "is_active",
            "is_verified",
            "created_at",
        ]

#WRITE OPERATIONS
class CompanyCreateSerializer(serializers.ModelSerializer):
    overview = CompanyOverviewSerializer(required=False)
    structure = CompanyStructureSerializer(required=False)
    operations = CompanyOperationsSerializer(required=False)
    registration_accounts = RegistrationAccountsWriteSerializer(many = True, read_only = True)
    banker_accounts = BankerAccountsWriteSerializer(many = True, read_only = True)
    professional_partners = ProfessionalPartnersWriteSerializer(many = True, read_only = True)
    trade_references = TradeReferencesWriteSerializer(read_only = True, many=True)

    class Meta:
        model = Company
        fields = "__all__"

    def _create_generic_relations(self, company, data_list, model):
        content_type = ContentType.objects.get_for_model(company)
        for item in data_list:
            item.pop("id", None)
            model.objects.create(
                subject_content_type=content_type,
                subject_object_id=company.id,
                **item
            )

    def create(self, validated_data):
        overview_data = validated_data.pop("overview", None)
        structure_data = validated_data.pop("structure", None)
        operations_data = validated_data.pop("operations", None)
        registration_accounts_data = validated_data.pop("registration_accounts", [])
        banker_accounts_data = validated_data.pop("banker_accounts", [])
        professional_partners_data = validated_data.pop("professional_partners", [])
        trade_references_data = validated_data.pop("trade_references", [])

        with transaction.atomic():
            company = Company.objects.create(**validated_data)

            if overview_data:
                CompanyOverview.objects.create(company=company, **overview_data)
            if structure_data:
                CompanyStructure.objects.create(company=company, **structure_data)
            if operations_data:
                CompanyOperations.objects.create(company=company, **operations_data)

            self._create_generic_relations(company, registration_accounts_data, RegistrationAccounts)
            self._create_generic_relations(company, banker_accounts_data, BankerAccounts)
            self._create_generic_relations(company, professional_partners_data, ProfessionalPartners)
            self._create_generic_relations(company, trade_references_data, TradeReferences)
        return company


class CompanyUpdateSerializer(serializers.ModelSerializer):
    overview = CompanyOverviewSerializer(required=False)
    structure = CompanyStructureSerializer(required=False)
    operations = CompanyOperationsSerializer(required=False)
    registration_accounts = RegistrationAccountsWriteSerializer(many = True, read_only = True)
    banker_accounts = BankerAccountsWriteSerializer(many = True, read_only = True)
    professional_partners = ProfessionalPartnersWriteSerializer(many = True, read_only = True)
    trade_references = TradeReferencesWriteSerializer(read_only = True, many=True)
    company_name = serializers.CharField(required=False)

    class Meta:
        model = Company
        fields = "__all__"
    
    def _update_generic_relations(self, company, data_list, model):
        content_type = ContentType.objects.get_for_model(company)
        for item in data_list:
            item_id = item.pop("id", None)
            model.objects.update_or_create(
                pk=item_id,
                defaults={
                    **item,
                    "subject_content_type": content_type,
                    "subject_object_id": company.id,
                },
            )
        
    def update(self, instance, validated_data):
        overview_data = validated_data.pop("overview", None)
        structure_data = validated_data.pop("structure", None)
        operations_data = validated_data.pop("operations", None)
        registration_accounts_data = validated_data.pop("registration_accounts", [])
        banker_accounts_data = validated_data.pop("banker_accounts", [])
        professional_partners_data = validated_data.pop("professional_partners", [])
        trade_references_data = validated_data.pop("trade_references", [])

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if overview_data:
                overview_data.pop("id", None)
                CompanyOverview.objects.update_or_create(
                    company=instance, defaults=overview_data
                )
            if structure_data:
                structure_data.pop("id", None)
                CompanyStructure.objects.update_or_create(
                    company=instance, defaults=structure_data
                )
            if operations_data:
                operations_data.pop("id", None)
                CompanyOperations.objects.update_or_create(
                    company=instance, defaults=operations_data
                )

            self._update_generic_relations(instance, registration_accounts_data, RegistrationAccounts)
            self._update_generic_relations(instance, banker_accounts_data, BankerAccounts)
            self._update_generic_relations(instance, professional_partners_data, ProfessionalPartners)
            self._update_generic_relations(instance, trade_references_data, TradeReferences)
        return instance
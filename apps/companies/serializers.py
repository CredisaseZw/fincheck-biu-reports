from django.utils import timezone
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
from apps.credit_records.serializers import (
    ClaimsSerializer,
    AbscondersSerializer,
    CourtJudgementSerializer,
    InsolvencyRecordSerializer,
    PublicInformationSerializer,
)

from django.contrib.contenttypes.models import ContentType
from apps.directors.serializers import DirectorSerializer
from apps.utils.base_serialisers import UpdatedBySerializerMixin
from apps.shareholding.serializers import ShareholdingsSerializers
# GET OPERATIONS
class CompanyOverviewSerializer(UpdatedBySerializerMixin,serializers.ModelSerializer):
    class Meta:
        model = CompanyOverview
        exclude = [
            "created_at",
            "updated_at",
            "company",
        ]

class CompanyStructureSerializer(UpdatedBySerializerMixin,serializers.ModelSerializer):
    class Meta:
        model = CompanyStructure
        fields = [
            'holding_company',
            'subsidiaries',
            'associated_companies',
            'divisions',
            'branches',
            'updated_by'
        ]

class CompanyOperationsSerializer(UpdatedBySerializerMixin,serializers.ModelSerializer):
    class Meta:
        model = CompanyOperations
        exclude = [
            "created_at",
            "updated_at",
            "company",
        ]
class CompanySerializer(UpdatedBySerializerMixin, serializers.ModelSerializer):
    overview = CompanyOverviewSerializer(read_only=True)
    structure = CompanyStructureSerializer(read_only=True)
    operations = CompanyOperationsSerializer(read_only=True)
    directors = DirectorSerializer(many=True, read_only = True)
    shareholdings = ShareholdingsSerializers(read_only = True)
    claims = ClaimsSerializer(read_only= True, many = True)
    absconders = AbscondersSerializer(read_only= True, many = True)
    court_judgements = CourtJudgementSerializer(read_only= True, many = True)
    insolvency_records = InsolvencyRecordSerializer(read_only= True, many = True)
    public_information = PublicInformationSerializer(read_only= True, many = True)
    trade_references = TradeReferencesSerializer(read_only = True, many=True)
    banker_accounts = BankerAccountsSerializer(many = True, read_only = True)
    company_name = serializers.CharField(read_only=True)
    refer_type = serializers.CharField(source="get_refer_type_display", read_only=True)
   
    def to_representation(self, instance):
        data =  super().to_representation(instance)

        professional_partners = instance.professional_partners.first()
        registration_accounts = instance.registration_accounts.first()
        financials = instance.financials.first()
        data['professional_partners'] = ProfessionalPartnersSerializer(professional_partners).data if professional_partners else None
        data['registration_accounts'] = RegistrationAccountsSerializer(registration_accounts).data if registration_accounts else None
        data['financials'] = FinancialsSerializer(financials).data if financials else None
        return data
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
            "registration_number",
            "refer_type",
            "email",
            "telephone_number",
            "is_active",
            "is_company_verified",
            "created_at",
            'updated_by'
        ]

#WRITE OPERATIONS
class CompanyCreateSerializer(serializers.ModelSerializer):    #NOT REQUIRED
    claims = ClaimsSerializer(read_only=True, many=True, required=False)
    absconders = AbscondersSerializer(read_only=True, many=True, required=False)
    court_judgements = CourtJudgementSerializer(read_only=True, many=True, required=False)
    insolvency_records = InsolvencyRecordSerializer(read_only=True, many=True, required=False)
    public_information = PublicInformationSerializer(read_only=True, many=True, required=False)
    trade_references = TradeReferencesWriteSerializer(many=True, write_only=True, required=False)
    overview = CompanyOverviewSerializer(required=False, write_only=True,)
    structure = CompanyStructureSerializer(required=False, write_only=True,)
    operations = CompanyOperationsSerializer(required=False, write_only=True,)
    banker_accounts = BankerAccountsWriteSerializer(many = True, write_only=True, required=False)
    registration_accounts = RegistrationAccountsWriteSerializer(required=False, write_only=True)
    professional_partners = ProfessionalPartnersWriteSerializer(required=False, write_only=True)
        
    def to_representation(self, instance):
        data = super().to_representation(instance)

        professional_partners = instance.professional_partners.first()
        registration_accounts = instance.registration_accounts.first()
        data['professional_partners'] = ProfessionalPartnersSerializer(professional_partners).data if professional_partners else None
        data['registration_accounts'] = RegistrationAccountsSerializer(registration_accounts).data if registration_accounts else None
        data['trade_references'] = TradeReferencesSerializer(instance.trade_references.all(), many=True).data
        data['banker_accounts'] = BankerAccountsSerializer(instance.banker_accounts.all(), many=True).data

        overview = getattr(instance, "overview", None)
        structure = getattr(instance, "structure", None)
        operations = getattr(instance, "operations", None)
        data['overview'] = CompanyOverviewSerializer(overview).data if overview else None
        data['structure'] = CompanyStructureSerializer(structure).data if structure else None
        data['operations'] = CompanyOperationsSerializer(operations).data if operations else None

        return data
    class Meta:
        model = Company
        fields = "__all__"

    def _create_generic_relations(self, company, data_list, model, content_type, updated_by = None):
        for item in data_list:
            item.pop("id", None)
            model.objects.create(
                subject_content_type=content_type,
                subject_object_id=company.id,
                updated_by = updated_by,
                **item
            )

    def _create_oto_generic(self, instance, data, model, content_type, updated_by = None):
        if not data:
            return
        data = data.copy()
        data.pop("id", None)
        model.objects.create(
            subject_content_type=content_type,
            subject_object_id=instance.id,
            updated_by = updated_by,
            **data
        )


    def create(self, validated_data):
        updated_by = validated_data.get("updated_by", None) 
        overview_data = validated_data.pop("overview", None)
        structure_data = validated_data.pop("structure", None)
        operations_data = validated_data.pop("operations", None)
        professional_partners_data = validated_data.pop("professional_partners", None)
        registration_accounts_data = validated_data.pop("registration_accounts", [])
        banker_accounts_data = validated_data.pop("banker_accounts", [])
        trade_references_data = validated_data.pop("trade_references", [])

        with transaction.atomic():
            company = Company.objects.create(**validated_data)
            content_type = ContentType.objects.get_for_model(company)

            if overview_data:
                CompanyOverview.objects.create(
                    company=company, 
                    updated_by = updated_by,
                    **overview_data)
            if structure_data:
                CompanyStructure.objects.create(
                    company=company, 
                    updated_by = updated_by,
                    **structure_data)
            if operations_data:
                CompanyOperations.objects.create(
                    company=company, 
                    updated_by = updated_by,
                    **operations_data)

            self._create_oto_generic(company, registration_accounts_data, RegistrationAccounts, content_type, updated_by)
            self._create_generic_relations(company, banker_accounts_data, BankerAccounts,content_type, updated_by)
            self._create_oto_generic(company, professional_partners_data, ProfessionalPartners, content_type, updated_by)
            self._create_generic_relations(company, trade_references_data, TradeReferences,content_type, updated_by)
        return company

class CompanyUpdateSerializer(serializers.ModelSerializer):
    claims = ClaimsSerializer(read_only=True, many=True, required=False)
    absconders = AbscondersSerializer(read_only=True, many=True, required=False)
    court_judgements = CourtJudgementSerializer(read_only=True, many=True, required=False)
    insolvency_records = InsolvencyRecordSerializer(read_only=True, many=True, required=False)
    public_information = PublicInformationSerializer(read_only=True, many=True, required=False)
    overview = CompanyOverviewSerializer(required=False,write_only=True,)
    structure = CompanyStructureSerializer(required=False, write_only=True)
    operations = CompanyOperationsSerializer(required=False, write_only=True)
    company_name = serializers.CharField(required=False)
    banker_accounts = BankerAccountsWriteSerializer(many = True, write_only=True, required=False)
    trade_references = TradeReferencesWriteSerializer(many=True, write_only=True, required=False)
    registration_accounts = RegistrationAccountsWriteSerializer(required=False, write_only=True)
    professional_partners = ProfessionalPartnersWriteSerializer(required=False, write_only=True)
   
    def to_representation(self, instance):
        data = super().to_representation(instance)

        professional_partners = instance.professional_partners.first()
        registration_accounts = instance.registration_accounts.first()
        data['professional_partners'] = ProfessionalPartnersSerializer(professional_partners).data if professional_partners else None
        data['registration_accounts'] = RegistrationAccountsSerializer(registration_accounts).data if registration_accounts else None
        data['trade_references'] = TradeReferencesSerializer(instance.trade_references.all(), many=True).data
        data['banker_accounts'] = BankerAccountsSerializer(instance.banker_accounts.all(), many=True).data

        overview = getattr(instance, "overview", None)
        structure = getattr(instance, "structure", None)
        operations = getattr(instance, "operations", None)
        data['overview'] = CompanyOverviewSerializer(overview).data if overview else None
        data['structure'] = CompanyStructureSerializer(structure).data if structure else None
        data['operations'] = CompanyOperationsSerializer(operations).data if operations else None

        return data
    class Meta:
        model = Company
        fields = "__all__"
    
    def _update_generic_relations(self, company, data_list, model, content_type, updated_by = None):
        for item in data_list:
            item_id = item.pop("id", None)
            model.objects.update_or_create(
                pk=item_id,
                defaults={
                    **item,
                    'updated_by' : updated_by,
                    "subject_content_type": content_type,
                    "subject_object_id": company.id,
                },
            )

    def _update_oto_generic(self, instance, data, model, content_type, updated_by = None):
        if not data:
            return
        data = data.copy()
        data.pop("id", None)
        data['updated_by'] = updated_by
        model.objects.update_or_create(
            subject_content_type=content_type,
            subject_object_id=instance.id,
            defaults=data
        )

    def update(self, instance, validated_data):
        updated_by = validated_data.get("updated_by", None)
        overview_data = validated_data.pop("overview", None)
        structure_data = validated_data.pop("structure", None)
        operations_data = validated_data.pop("operations", None)
        professional_partners_data = validated_data.pop("professional_partners", None)
        registration_accounts_data = validated_data.pop("registration_accounts", [])
        banker_accounts_data = validated_data.pop("banker_accounts", [])
        trade_references_data = validated_data.pop("trade_references", [])
       
        for field in ["address_registered", "address_operations"]:
            new_val = validated_data.get(field)
            old_val = getattr(instance, field)
            if new_val and new_val != old_val and old_val:
                history = instance.prev_addresses or {"prev": []}
                prev_list = history.get("prev", [])
                entry = {"address": old_val, "field": field, "changed_at": timezone.now().isoformat()}
                if entry["address"] not in [e["address"] for e in prev_list]:
                    prev_list.append(entry)
                instance.prev_addresses = {"prev": prev_list}

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            content_type = ContentType.objects.get_for_model(instance)

            if overview_data:
                overview_data.pop("id", None)
                overview_data['updated_by'] = updated_by
                CompanyOverview.objects.update_or_create(
                    company=instance, defaults=overview_data
                )
            if structure_data:
                structure_data.pop("id", None)
                structure_data['updated_by'] = updated_by
                CompanyStructure.objects.update_or_create(
                    company=instance, defaults=structure_data
                )
            if operations_data:
                operations_data.pop("id", None)
                operations_data['updated_by'] = updated_by
                CompanyOperations.objects.update_or_create(
                    company=instance, defaults=operations_data
                )

            self._update_oto_generic(instance, professional_partners_data, ProfessionalPartners, content_type, updated_by)
            self._update_oto_generic(instance, registration_accounts_data, RegistrationAccounts, content_type, updated_by)
            self._update_generic_relations(instance, banker_accounts_data, BankerAccounts, content_type, updated_by)
            self._update_generic_relations(instance, trade_references_data, TradeReferences,content_type, updated_by)
        instance.refresh_from_db()
        return instance
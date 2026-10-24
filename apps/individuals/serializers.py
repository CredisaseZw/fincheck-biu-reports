from rest_framework import serializers
from django.db import transaction
from .models import Individuals, EmploymentInformation, NextOfKin
from apps.common.serializer import (
    RegistrationAccountsSerializer,
    ProfessionalPartnersSerializer,
    TradeReferencesSerializer,
    TradeReferencesWriteSerializer,
    BankerAccountsSerializer,
    BankerAccountsWriteSerializer,
)
from django.contrib.contenttypes.models import ContentType
from apps.common.models import (
    BankerAccounts,
    TradeReferences,
)
from apps.credit_records.serializers import (
    ClaimsSerializer,
    AbscondersSerializer,
    CourtJudgementSerializer,
    InsolvencyRecordSerializer,
    PublicInformationSerializer,
)
from apps.utils.enitity_helpers import sync_insolvencies_summary
from apps.utils.base_serialisers import UpdatedBySerializerMixin, NullableDateField
from apps.utils.entity_lookup import EntityLookUp
from apps.utils.manipulate_entities import CreateEntityGenericHandlers, UpdateEntityGenericHandlers
from apps.utils.mini_serializers import MiniCompanyDirectorSerializers

entity = EntityLookUp()
class EmploymentInformationSerializer(UpdatedBySerializerMixin,serializers.ModelSerializer):
    class Meta:
        model = EmploymentInformation
        exclude = ["created_at", "updated_at", "individual"]

class NextOfKinSerializer(UpdatedBySerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = NextOfKin
        exclude = ["created_at", "updated_at", "individual"]

class ClientIndividualSerializer(serializers.ModelSerializer):
    next_of_kin = NextOfKinSerializer(read_only=True)
    employment_information = EmploymentInformationSerializer(read_only=True)

    class Meta:
        model = Individuals
        fields = '__all__'

class IndividualSerializer(serializers.ModelSerializer):
    claims = ClaimsSerializer(read_only=True, many=True)
    directorships = MiniCompanyDirectorSerializers(read_only = True, many = True)
    absconders = AbscondersSerializer(read_only= True, many = True)
    court_judgements = CourtJudgementSerializer(read_only= True, many = True)
    insolvency_records = InsolvencyRecordSerializer(read_only= True, many = True)
    public_information = PublicInformationSerializer(read_only= True, many = True)
    trade_references = TradeReferencesSerializer(read_only = True, many=True)
    employment_information = EmploymentInformationSerializer(read_only=True)
    next_of_kin = NextOfKinSerializer(read_only=True)
    banker_accounts = BankerAccountsSerializer(many = True, read_only = True,)
    refer_type = serializers.CharField(source="get_refer_type_display", read_only=True)

    def to_representation(self, instance):
        payload = entity.hit_endpoint("individual", instance.national_id)
        if payload:
            chained_data = entity._prepare_serializer_individual_data(payload, instance.pk)
            entity.sync_entity_records(instance, chained_data)
        
        sync_insolvencies_summary(instance)

        instance.refresh_from_db()
        data = super().to_representation(instance)
        return data

    class Meta:
        model = Individuals
        fields = "__all__"

class IndividualListSerializer(serializers.ModelSerializer):
    refer_type = serializers.CharField(source="get_refer_type_display", read_only=True)
    class Meta:
        model = Individuals
        fields = [
            "id", "full_name", "national_id", "gender",
            "marital_status", "mobile_number", "email",
            "nationality", "refer_type", "created_at",
        ]
class IndividualDirectorSerializer(serializers.ModelSerializer):
    national_id = serializers.CharField(required=True)
    date_of_birth = NullableDateField(required=False, allow_null=True)

    def to_representation(self, instance):
        payload = entity.hit_endpoint("individual", instance.national_id)
        if payload:
            chained_data = entity._prepare_serializer_individual_data(payload, instance.pk)
            entity.sync_entity_records(instance, chained_data)

        sync_insolvencies_summary(instance)
        instance.refresh_from_db()
        return super().to_representation(instance)
    class Meta:
        model = Individuals
        fields = [
            "id",
            "full_name",
            "national_id",
            "gender",
            "date_of_birth",
            "residential_address",
            "mobile_number",
            "email",
            "address_prev",
            "insolvencies_judgements",
            "is_pep",
            'external_directors'
        ]

# Write Serializers 
class IndividualCreateSerializer(
    serializers.ModelSerializer,
    CreateEntityGenericHandlers
):
    date_of_birth = NullableDateField(required=False, allow_null=True)
    next_of_kin = NextOfKinSerializer(required=False)
    employment_information = EmploymentInformationSerializer(required=False)
    marital_status = serializers.ChoiceField(choices=Individuals.MaritalStatus.choices)
    banker_accounts = BankerAccountsWriteSerializer(many = True, write_only = True, required=False)
    claims = ClaimsSerializer(read_only=True, many=True, required=False)
    absconders = AbscondersSerializer(read_only=True, many=True, required=False)
    court_judgements = CourtJudgementSerializer(read_only=True, many=True, required=False)
    insolvency_records = InsolvencyRecordSerializer(read_only=True, many=True, required=False)
    public_information = PublicInformationSerializer(read_only=True, many=True, required=False)
    trade_references = TradeReferencesWriteSerializer(many=True, write_only=True, required=False)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        professional_partners = instance.professional_partners.first()
        accounts = instance.registration_accounts.first()
        data["professional_partners"] = ProfessionalPartnersSerializer(professional_partners).data if professional_partners else None
        data["registration_accounts"] = RegistrationAccountsSerializer(accounts).data if accounts else None
        data["trade_references"] = TradeReferencesSerializer(instance.trade_references.all(), many=True).data
        data["banker_accounts"] = BankerAccountsSerializer(instance.banker_accounts.all(), many=True).data
        
        return data
    
    class Meta:
        model = Individuals
        fields = "__all__"

    def create(self, validated_data):
        updated_by = validated_data.get("updated_by")
        employment_information_data = validated_data.pop("employment_information", None)
        next_of_kin_data = validated_data.pop("next_of_kin", None)
        banker_accounts_data = validated_data.pop("banker_accounts", [])
        trade_references_data = validated_data.pop("trade_references", [])

        with transaction.atomic():
            individual = Individuals.objects.create(**validated_data)
            content_type = ContentType.objects.get_for_model(individual)

            if employment_information_data:
                employment_information_data.pop("id",None)
                EmploymentInformation.objects.create(
                    **employment_information_data,
                    individual=individual,
                    updated_by = updated_by
                )

            if next_of_kin_data:
                next_of_kin_data.pop("id",None)
                NextOfKin.objects.create(
                    **next_of_kin_data,
                    individual=individual,
                    updated_by = updated_by
                )
            
            self._create_generic_relations(individual, banker_accounts_data, BankerAccounts, content_type, updated_by)
            self._create_generic_relations(individual, trade_references_data, TradeReferences,content_type, updated_by)
        return individual
    
class IndividualUpdateSerializer(serializers.ModelSerializer, UpdateEntityGenericHandlers):
    next_of_kin = NextOfKinSerializer(required=False)
    date_of_birth = NullableDateField(required=False, allow_null=True)
    employment_information = EmploymentInformationSerializer(required=False)
    marital_status = serializers.ChoiceField(choices=Individuals.MaritalStatus.choices)
    banker_accounts = BankerAccountsWriteSerializer(many = True, write_only = True, required=False)
    claims = ClaimsSerializer(read_only=True, many=True, required=False)
    absconders = AbscondersSerializer(read_only=True, many=True, required=False)
    court_judgements = CourtJudgementSerializer(read_only=True, many=True, required=False)
    insolvency_records = InsolvencyRecordSerializer(read_only=True, many=True, required=False)
    public_information = PublicInformationSerializer(read_only=True, many=True, required=False)
    trade_references = TradeReferencesWriteSerializer(many=True, write_only=True, required=False)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        professional_partners = instance.professional_partners.first()
        accounts = instance.registration_accounts.first()
        data["professional_partners"] = ProfessionalPartnersSerializer(professional_partners).data if professional_partners else None
        data["registration_accounts"] = RegistrationAccountsSerializer(accounts).data if accounts else None
        data["trade_references"] = TradeReferencesSerializer(instance.trade_references.all(), many=True).data
        data["banker_accounts"] = BankerAccountsSerializer(instance.banker_accounts.all(), many=True).data
        
        return data
    class Meta:
        model = Individuals
        fields = "__all__"

    def validate_national_id(self, value):
        return Individuals.normalize_national_id(value)
    
    def update(self, instance, validated_data):
        updated_by = validated_data.get("updated_by")
        employment_information_data = validated_data.pop("employment_information", None)
        next_of_kin_data = validated_data.pop("next_of_kin", None)
        banker_accounts_data = validated_data.pop("banker_accounts", [])
        trade_references_data = validated_data.pop("trade_references", [])

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            content_type = ContentType.objects.get_for_model(instance)
            if employment_information_data:
                employment_information_data.pop("id", None)
                employment_information_data['updated_by'] = updated_by
                EmploymentInformation.objects.update_or_create(
                    individual=instance,
                    defaults=employment_information_data
                )

            if next_of_kin_data:
                next_of_kin_data.pop("id", None)
                next_of_kin_data['updated_by'] = updated_by
                NextOfKin.objects.update_or_create(
                    individual=instance,
                    defaults=next_of_kin_data
                )
            
            self._update_banker_account_rows(instance, banker_accounts_data, content_type, updated_by)           
            self._update_generic_relations(instance, trade_references_data, TradeReferences, content_type, updated_by)
        instance.refresh_from_db()
        return instance
    
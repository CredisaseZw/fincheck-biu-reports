from rest_framework import serializers
from django.db import transaction
from .models import Individuals, EmploymentInformation, NextOfKin
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
from apps.common.models import (
    BankerAccounts,
    TradeReferences,
    RegistrationAccounts,
    ProfessionalPartners,
)

class EmploymentInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentInformation
        exclude = ["created_at", "updated_at", "individual"]

class NextOfKinSerializer(serializers.ModelSerializer):
    class Meta:
        model = NextOfKin
        exclude = ["created_at", "updated_at", "individual"]

class IndividualSerializer(serializers.ModelSerializer):
    trade_references = TradeReferencesSerializer(read_only = True, many=True)
    employment_information = EmploymentInformationSerializer(read_only=True)
    next_of_kin = NextOfKinSerializer(read_only=True)
    registration_accounts = RegistrationAccountsSerializer(many = True, read_only = True)
    banker_accounts = BankerAccountsSerializer(many = True, read_only = True,)
    professional_partners = ProfessionalPartnersSerializer(many = True, read_only = True)
    financials = FinancialsSerializer(many = True, read_only = True)
    refer_type = serializers.CharField(source="get_refer_type_display", read_only=True)

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


# Write Serializers 
class IndividualCreateSerializer(serializers.ModelSerializer):
    next_of_kin = NextOfKinSerializer(required=False)
    employment_information = EmploymentInformationSerializer(required=False)
    marital_status = serializers.ChoiceField(choices=Individuals.MaritalStatus.choices)
    trade_references = TradeReferencesWriteSerializer(read_only = True, many=True)
    registration_accounts = RegistrationAccountsWriteSerializer(many = True, read_only = True)
    banker_accounts = BankerAccountsWriteSerializer(many = True, read_only = True)
    professional_partners = ProfessionalPartnersWriteSerializer(many = True, read_only = True)

    class Meta:
        model = Individuals
        fields = "__all__"

    def _create_generic_relations(self, individual, data_list, model):
        content_type = ContentType.objects.get_for_model(individual)
        for item in data_list:
            item.pop("id", None)
            model.objects.create(
                subject_content_type=content_type,
                subject_object_id=individual.id,
                **item
            )

    def create(self, validated_data):
        employment_information_data = validated_data.pop("employment_information", None)
        next_of_kin_data = validated_data.pop("next_of_kin", None)
        registration_accounts_data = validated_data.pop("registration_accounts", [])
        banker_accounts_data = validated_data.pop("banker_accounts", [])
        professional_partners_data = validated_data.pop("professional_partners", [])
        trade_references_data = validated_data.pop("trade_references", [])

        with transaction.atomic():
            individual = Individuals.objects.create(**validated_data)

            if employment_information_data:
                employment_information_data.pop("id",None)
                EmploymentInformation.objects.create(
                    **employment_information_data,
                    individual=individual
                )

            if next_of_kin_data:
                next_of_kin_data.pop("id",None)
                NextOfKin.objects.create(
                    **next_of_kin_data,
                    individual=individual
                )

            self._create_generic_relations(individual, registration_accounts_data, RegistrationAccounts)
            self._create_generic_relations(individual, banker_accounts_data, BankerAccounts)
            self._create_generic_relations(individual, professional_partners_data, ProfessionalPartners)
            self._create_generic_relations(individual, trade_references_data, TradeReferences)
        return individual
    
class IndividualUpdateSerializer(serializers.ModelSerializer):
    next_of_kin = NextOfKinSerializer(required=False)
    employment_information = EmploymentInformationSerializer(required=False)
    marital_status = serializers.ChoiceField(choices=Individuals.MaritalStatus.choices)
    trade_references = TradeReferencesWriteSerializer(read_only = True, many=True)
    registration_accounts = RegistrationAccountsWriteSerializer(many = True, read_only = True)
    banker_accounts = BankerAccountsWriteSerializer(many = True, read_only = True)
    professional_partners = ProfessionalPartnersWriteSerializer(many = True, read_only = True)
    
    class Meta:
        model = Individuals
        fields = "__all__"

    def _update_generic_relations(self, individual, data_list, model):
        content_type = ContentType.objects.get_for_model(individual)
        for item in data_list:
            item_id = item.pop("id", None)
            model.objects.update_or_create(
                pk=item_id,
                defaults={
                    **item,
                    "subject_content_type": content_type,
                    "subject_object_id": individual.id,
                },
            )

    def update(self, instance, validated_data):
        employment_information_data = validated_data.pop("employment_information", None)
        next_of_kin_data = validated_data.pop("next_of_kin", None)
        registration_accounts_data = validated_data.pop("registration_accounts", [])
        banker_accounts_data = validated_data.pop("banker_accounts", [])
        professional_partners_data = validated_data.pop("professional_partners", [])
        trade_references_data = validated_data.pop("trade_references", [])

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if employment_information_data:
                employment_information_data.pop("id", None)
                EmploymentInformation.objects.update_or_create(
                    individual=instance,
                    defaults=employment_information_data
                )

            if next_of_kin_data:
                next_of_kin_data.pop("id", None)
                NextOfKin.objects.update_or_create(
                    individual=instance,
                    defaults=next_of_kin_data
                )

            self._update_generic_relations(instance, registration_accounts_data, RegistrationAccounts)
            self._update_generic_relations(instance, banker_accounts_data, BankerAccounts)
            self._update_generic_relations(instance, professional_partners_data, ProfessionalPartners)
            self._update_generic_relations(instance, trade_references_data, TradeReferences)
        instance.refresh_from_db()
        return instance
    
    
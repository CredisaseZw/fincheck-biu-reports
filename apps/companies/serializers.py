from django.db import transaction
from rest_framework import serializers
from apps.companies.models import (
    Company,
    CompanyOperations,
    CompanyOverview,
    CompanyStructure,

)

# GET OPERATIONS
class CompanyOverviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyOverview
        exclude = [
            "created_at",
            "updated_at",
            "company",
            "id"
        ]
class MiniCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "registered_name",
            "trading_name",
            "address_registered",
            "email",  
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
            "id"
        ]
class CompanySerializer(serializers.ModelSerializer):
    overview = CompanyOverviewSerializer(read_only=True)
    structure = CompanyStructureSerializer(read_only=True)
    operations = CompanyOperationsSerializer(read_only=True)
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

    class Meta:
        model = Company
        fields = "__all__"

    def create(self, validated_data):
        overview_data = validated_data.pop("overview", None)
        structure_data = validated_data.pop("structure", None)
        operations_data = validated_data.pop("operations", None)

        with transaction.atomic():
            company = Company.objects.create(**validated_data)
            if overview_data:
                CompanyOverview.objects.create(company=company, **overview_data)
            if structure_data:
                CompanyStructure.objects.create(company=company, **structure_data)
            if operations_data:
                CompanyOperations.objects.create(company=company, **operations_data)

        return company
class CompanyUpdateSerializer(serializers.ModelSerializer):
    overview = CompanyOverviewSerializer(required=False)
    structure = CompanyStructureSerializer(required=False)
    operations = CompanyOperationsSerializer(required=False)
    company_name = serializers.CharField(required=False)

    class Meta:
        model = Company
        fields = "__all__"

    def update(self, instance, validated_data):
        overview_data = validated_data.pop("overview", None)
        structure_data = validated_data.pop("structure", None)
        operations_data = validated_data.pop("operations", None)

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if overview_data:
                CompanyOverview.objects.update_or_create(
                    company=instance, defaults=overview_data
                )
            if structure_data:
                CompanyStructure.objects.update_or_create(
                    company=instance, defaults=structure_data
                )
            if operations_data:
                CompanyOperations.objects.update_or_create(
                    company=instance, defaults=operations_data
                )
        return instance
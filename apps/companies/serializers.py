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
            "created_at", "updated_at","company"
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
        exclude = ["created_at", "updated_at", 'company']


class CompanySerializer(serializers.ModelSerializer):
    overview = CompanyOverviewSerializer(read_only=True)
    structure = CompanyStructureSerializer(read_only=True)
    operations = CompanyOperationsSerializer(read_only=True)
    company_name = serializers.CharField(read_only=True)
    refer_type = serializers.CharField(source="get_refer_type_display", read_only=True)

    class Meta:
        model = Company
        exclude = ["reports_as_client", "reports_as_subject"]


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

    class Meta:
        model = Company
        exclude = ["reports_as_client", "reports_as_subject"]

    def create(self, validated_data):
        overview_data = validated_data.pop("overview", None)
        
        with transaction.atomic():
            company = Company.objects.create(**validated_data)
            if overview_data:
                CompanyOverview.objects.create(company=company, **overview_data)
        
        return company

class CompanyWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        exclude = ["reports_as_client", "reports_as_subject"]

class CompanyStructureCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyStructure
        fields = '__all__'

class CompanyOperationsCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyOperations
        fields = '__all__'

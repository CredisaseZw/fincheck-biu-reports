from rest_framework import serializers
from apps.companies.models import Company
from apps.individuals.models import Individuals

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


class MiniIndividualSerializer(serializers.ModelSerializer):
    class Meta:
        model = Individuals
        fields = [
            "id", 
            "full_name",
            "national_id",
            "residential_address",
            "mobile_number",
            "email"
        ]
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
            "registration_number",
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
        
class MiniIndividualDebtorSerializers(serializers.ModelSerializer):
    extras = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    class Meta:
        model = Individuals
        fields = [
            'name',
            'extras'
        ]

    def get_name(self, obj):
        return obj.full_name

    def get_extras(self, obj):
        return {
            "debtor_object_id" : obj.id,
            "debtor_type" : "individual"      
        }
class MiniCompanyDebtorSerializers(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    extras = serializers.SerializerMethodField()
    class Meta:
        model = Company
        fields = [
            "name",
            "extras"
        ]
    def get_name(self, obj):
        return obj.registered_name
    
    def get_extras(self, obj):
        return {
            "debtor_object_id" : obj.id,
            "debtor_type" : "company"      
        }
from rest_framework import serializers
from apps.companies.models import Company
from apps.individuals.models import Individuals
from apps.directors.models import CompanyDirector
from apps.utils.enitity_helpers import _build_insolvencies_summary
from apps.utils.entity_lookup import EntityLookUp

entity = EntityLookUp()
class MiniCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "registered_name",
            "trading_name",
            "registration_number",
            're_registration_number',
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
            "residential_address",
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
class MiniCompanyDirectorSerializers(serializers.ModelSerializer):
    company = MiniCompanySerializer(read_only=True)
    company_credit_records = serializers.SerializerMethodField()
    class Meta:
        model = CompanyDirector
        fields = [
            "id",
            "position",
            "company",
            "company_credit_records"
        ]

    def get_company_credit_records(self, instance: CompanyDirector):
        if instance.company_id is None:
            return None

        if instance.company.registration_number in ("", None):
            return None 
        
        payload = entity.hit_endpoint("company", instance.company.registration_number)
        if payload:
            chained_data = entity._prepare_serializer_company_data(payload, instance.company.pk)
            entity.sync_entity_records(instance.company, chained_data)
            insolvencies = _build_insolvencies_summary(instance.company)
            if insolvencies == "" or len(insolvencies) == 0:
                return "CLEAR TO DATE IN THE NAME OF THE BUSINESS AND PRINCIPALS"
        return None

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
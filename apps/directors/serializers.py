from .models import CompanyDirector
from apps.companies.models import Company
from rest_framework import serializers

class DirectorSerializer(serializers.ModelSerializer):
    class Meta: 
        model = CompanyDirector
        exclude = ['company']


class CompanyDirectorSerializer(serializers.ModelSerializer):
    directors = DirectorSerializer(many = True, read_only =True)
        
    class Meta:
        model = Company
        fields = [
            "id",
            "registered_name",
            "trading_name",
            "address_registered",
            "email",  
            "directors"
        ]
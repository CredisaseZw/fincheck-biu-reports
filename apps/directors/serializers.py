from rest_framework import serializers
from apps.companies.models import Company
from apps.individuals.serializers import IndividualDirectorSerializer
from .models import CompanyDirector
class DirectorSerializer(serializers.ModelSerializer):
    individual_detail = IndividualDirectorSerializer(source="individual", read_only=True)
    class Meta:
        model = CompanyDirector
        exclude = ['company']

class CompanyDirectorsSerializer(serializers.ModelSerializer):
    directors = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ["directors"]

    def get_directors(self, instance):
        directors = instance.directors.order_by("-created_at")
        return DirectorSerializer(directors, many=True).data


class CompanyDirectorWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyDirector
        exclude = ['company', 'individual']
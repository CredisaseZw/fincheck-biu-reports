from rest_framework import serializers
from apps.companies.models import Company
from apps.utils.mini_serializers import MiniCompanyDirectorSerializers
from apps.individuals.serializers import IndividualDirectorSerializer
from .models import CompanyDirector

def build_other_directors_string(data : dict):
    return f"{data.get("position", "Director").upper()} AT {data.get("company", "N/A").upper()}"
class DirectorSerializer(serializers.ModelSerializer):
    individual_detail = IndividualDirectorSerializer(source="individual", read_only=True)
    class Meta:
        model = CompanyDirector
        exclude = ['company']
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not getattr(instance, "individual_id", None):
            data["other_individual_directorships"] = []
            return data

        company_id = getattr(instance, "company_id", None)
        others = CompanyDirector.objects.filter(individual_id=instance.individual_id)
        if company_id:
            others = others.exclude(company_id=company_id)
        others = others.select_related("company")
        
        p_ = [ build_other_directors_string(i) for i in MiniCompanyDirectorSerializers(others, many=True).data ]
        data["other_individual_directorships"] = p_
        return data

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
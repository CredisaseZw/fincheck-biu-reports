from rest_framework import serializers
from apps.companies.models import Company
from apps.utils.mini_serializers import MiniCompanyDirectorSerializers, MiniCompanySerializer, MiniIndividualSerializer
from apps.individuals.serializers import IndividualDirectorSerializer
from .models import CompanyDirector, CompanySecretary
from apps.utils.base_serialisers import NullableDateField

def build_other_directors_string(data : dict):
    return f"{data.get("position", "Director").upper()} AT {data.get("company", "N/A").upper()}"

class DirectorSerializer(serializers.ModelSerializer):
    individual_detail = IndividualDirectorSerializer(source="individual", read_only=True)
    company_secretary = MiniCompanySerializer(read_only=True)
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
        directors = instance.directors.order_by("created_at")
        return DirectorSerializer(directors, many=True).data

class CompanySecretaryReadSerializer(serializers.ModelSerializer):
    company = MiniCompanySerializer(read_only=True)
    secretary = MiniCompanySerializer(read_only=True)

    class Meta:
        model = CompanySecretary
        fields = [
            "id",
            "company",
            "secretary",
            "date_of_appointment",
            "created_at",
        ]
        read_only_fields = fields


class CompanySecretaryNoCompanyReadSerializer(serializers.ModelSerializer):
    secretary = MiniCompanySerializer(read_only=True)

    class Meta:
        model = CompanySecretary
        fields = [
            "id",
            "secretary",
            "date_of_appointment",
            "created_at",
        ]
        read_only_fields = fields

class CompanySecretaryWriteSerializer(serializers.ModelSerializer):
    """Write with company and secretary passed as IDs."""
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all())
    date_of_appointment = serializers.DateField(required=False, allow_null=True)
    secretary = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = CompanySecretary
        fields = [
            "id",
            "company",
            "secretary",
            "date_of_appointment",
        ]
    
    def validate(self, attrs):
        company = attrs.get("company", getattr(self.instance, "company", None))
        secretary = attrs.get("secretary", getattr(self.instance, "secretary", None))
        if company and secretary and company == secretary:
            raise serializers.ValidationError(
                {"secretary": "A company cannot be its own secretary."}
            )
        return attrs

    def to_representation(self, instance):
        return CompanySecretaryReadSerializer(instance, context=self.context).data


class CompanyDirectorWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyDirector
        exclude = ['company', 'individual']

class CompanySecretaryNoCompanyWriteSerializer(serializers.ModelSerializer):
    date_of_appointment = NullableDateField(required=False, allow_null=True)
    secretary = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = CompanySecretary
        fields = ["id", "secretary", "date_of_appointment"]


    def validate(self, attrs):
        company = self.context.get("company") or getattr(self.instance, "company", None)
        secretary = attrs.get("secretary", getattr(self.instance, "secretary", None))

        if self.instance is None and not secretary:
            raise serializers.ValidationError(
                {"secretary": "A secretary is required."}
            )

        if company and secretary:
            if company == secretary:
                raise serializers.ValidationError(
                    {"secretary": "A company cannot be its own secretary."}
                )
            qs = CompanySecretary.objects.filter(company=company, secretary=secretary)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"secretary": "This company is already appointed as secretary."}
                )
        return attrs

    def to_representation(self, instance):
        return CompanySecretaryNoCompanyReadSerializer(instance, context=self.context).data
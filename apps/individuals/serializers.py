from rest_framework import serializers
from django.db import transaction
from .models import Individuals, EmploymentInformation, NextOfKin


class EmploymentInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentInformation
        exclude = ["created_at", "updated_at", "individual"]


class NextOfKinSerializer(serializers.ModelSerializer):
    class Meta:
        model = NextOfKin
        exclude = ["created_at", "updated_at", "individual"]


class IndividualSerializer(serializers.ModelSerializer):
    employment_information = EmploymentInformationSerializer(read_only=True)
    next_of_kin = NextOfKinSerializer(read_only=True)
    marital_status = serializers.CharField(source="get_marital_status_display", read_only=True)
    refer_type = serializers.CharField(source="get_refer_type_display", read_only=True)

    class Meta:
        model = Individuals
        fields = "__all__"


class IndividualListSerializer(serializers.ModelSerializer):
    marital_status = serializers.CharField(source="get_marital_status_display", read_only=True)
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
    next_of_kin = NextOfKinSerializer(required = False)
    employment_information = EmploymentInformationSerializer(required = False)
    marital_status = serializers.ChoiceField(choices=Individuals.MaritalStatus.choices)
    refer_type = serializers.ChoiceField(choices=Individuals.ReferType.choices)

    class Meta:
        model = Individuals
        fields = "__all__"

    def create(self, validated_data):
        employment_information_data = validated_data.pop("employment_information", None)
        next_of_kin_data = validated_data.pop("next_of_kin", None)

        with transaction.atomic():
            individual = Individuals.objects.create(**validated_data)
            if employment_information_data:
                EmploymentInformation.objects.create(
                    **employment_information_data,
                    individual = individual
                )
            
            if next_of_kin_data:
                NextOfKin.objects.create(
                    **next_of_kin_data,
                    individual = individual
                )
        return individual
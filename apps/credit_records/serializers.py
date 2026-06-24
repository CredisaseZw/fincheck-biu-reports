from rest_framework import serializers
from apps.utils.mini_serializers import MiniIndividualDebtorSerializers, MiniCompanyDebtorSerializers
from .models import Claims, Absconders, CourtJudgement, InsolvencyRecord, PublicInformation

def _get_debtor_data(debtor):
    if not debtor:
        return None
    if hasattr(debtor, "next_of_kin"):
        return MiniIndividualDebtorSerializers(debtor).data
    return MiniCompanyDebtorSerializers(debtor).data

#READ SERIALIZERS 
class ClaimsSerializer(serializers.ModelSerializer):
    debtor = serializers.SerializerMethodField()
    class Meta:
        model = Claims
        fields = [
            "id",
            "debtor",
            "creditor_name",
            "currency",
            "amount",
            "claim_date",
            "status",
        ]

    def get_debtor(self, obj):
        return _get_debtor_data(obj.debtor)

class AbscondersSerializer(serializers.ModelSerializer): 
    debtor =  serializers.SerializerMethodField()
    class Meta:
        model = Absconders
        fields = [
            "id",
            "debtor",
            "creditor_name",
            "currency",
            "amount",
            "start_date",
            "status",
        ]
    
    def get_debtor(self, obj):
        return _get_debtor_data(obj.debtor)
    
class CourtJudgementSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourtJudgement
        fields = [
            "id",
            "court_name",
            "case_number",
            "judgement_date",
            "currency",
            "amount",
        ]

class InsolvencyRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsolvencyRecord
        fields = [
            "id",
            "start_date",
            "end_date",
            "court_reference",
            "insolvency_type",
        ]
    

class PublicInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicInformation
        fields = [
            "id",
            'record_date',
            "summary",
            "link",
        ]

# WRITE SERIALIZERS

class ClaimsWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claims
        fields = [
            "subject_content_type",
            "subject_object_id",
            "debtor_content_type",
            "debtor_object_id",
            "creditor_name",
            "currency",
            "amount",
            "claim_date",
            "status",
        ]
class AbscondersWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Absconders
        fields = [
            "subject_content_type",
            "subject_object_id",
            "debtor_content_type",
            "debtor_object_id",
            "creditor_name",
            "currency",
            "amount",
            "start_date",
            "status",
        ]


class CourtJudgementWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourtJudgement
        fields = [
            "subject_content_type",
            "subject_object_id",
            "court_name",
            "case_number",
            "judgement_date",
            "currency",
            "amount",
        ]


class InsolvencyRecordWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsolvencyRecord
        fields = [
            "subject_content_type",
            "subject_object_id",
            "insolvency_type",
            "start_date",
            "end_date",
            "court_reference"
        ]
class PublicInformationWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicInformation
        fields = [
            "subject_content_type",
            "subject_object_id",
            'record_date',
            "summary",
            "link",
        ]
from rest_framework import serializers
from apps.reports.models import Report
from apps.utils.mini_serializers import MiniCompanySerializer
from apps.utils.mini_serializers import MiniIndividualSerializer
from .models import Claims, Absconders, CourtJudgement, InsolvencyRecord, PublicInformation

def _get_debtor_data(debtor):
    if not debtor:
        return None
    if hasattr(debtor, "next_of_kin"):
        return MiniIndividualSerializer(debtor).data
    return MiniCompanySerializer(debtor).data

#READ SERIALIZERS
class ClaimsSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    debtor = serializers.SerializerMethodField()

    class Meta:
        model = Claims
        fields = [
            "id",
            "report",
            "debtor",
            "creditor_name",
            "currency",
            "amount",
            "claim_date",
            "status_display",
        ]

    def get_debtor(self, obj):
        return _get_debtor_data(obj.debtor)

class AbscondersSerializer(serializers.ModelSerializer): 
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    class Meta:
        model = Absconders
        fields = [
            "id",
            "report",
            "debtor",
            "creditor_name",
            "currency",
            "amount",
            "start_date",
            "status_display",
        ]
    
    def get_debtor(self, obj):
        return _get_debtor_data(obj.debtor)
    
class CourtJudgementSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourtJudgement
        fields = [
            "id",
            "report",
            "court_name",
            "case_number",
            "judgement_date",
            "amount",
        ]

class InsolvencyRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsolvencyRecord
        fields = [
            "id",
            "report",
            "debtor",
            "creditor_name",
            "currency",
            "amount",
            "insolvency_type",
            "filing_date",
        ]
    
    def get_debtor(self, obj):
        return _get_debtor_data(obj.debtor)

class PublicInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicInformation
        fields = [
            "id",
            "report",
            "summary",
            "link",
        ]

class CreditRecordsSerializer(serializers.ModelSerializer):
    claims = ClaimsSerializer(many=True, read_only=True, source="claims_report")
    absconders = AbscondersSerializer(many=True, read_only=True, source="absconders_report")
    court_judgements = CourtJudgementSerializer(many=True, read_only=True, source="courtjudgement_report")
    insolvency_records = InsolvencyRecordSerializer(many=True, read_only=True, source="insolvencyrecord_report")
    public_information = PublicInformationSerializer(many=True, read_only=True, source="publicinformation_report")

    class Meta:
        model = Report
        fields = [
            "claims",
            "absconders",
            "court_judgements",
            "insolvency_records",
            "public_information",
        ]   

# WRITE SERIALIZERS

class ClaimsWriteSerializer(serializers.ModelSerializer):
    status_display = serializers.ChoiceField(choices=Claims.SettlementOptions.choices, required=False)
    class Meta:
        model = Claims
        fields = [
            "report",
            "debtor_content_type",
            "debtor_object_id",
            "creditor_name",
            "currency",
            "amount",
            "claim_date",
            "status_display",
        ]
class AbscondersWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Absconders
        fields = [
            "report",
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
            "report",
            "court_name",
            "case_number",
            "judgement_date",
            "amount",
        ]


class InsolvencyRecordWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsolvencyRecord
        fields = [
            "report",
            "debtor_content_type",
            "debtor_object_id",
            "creditor_name",
            "currency",
            "amount",
            "insolvency_type",
            "filing_date",
        ]


class PublicInformationWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicInformation
        fields = [
            "report",
            "summary",
            "link",
        ]
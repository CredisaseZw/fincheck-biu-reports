from rest_framework import serializers
from apps.companies.serializers import CompanySerializer, MiniCompanySerializer
from apps.individuals.serializers import IndividualSerializer, MiniIndividualSerializer
from .models import TradeReferences, ReportSummary, Report
from apps.credit_records.serializers import CreditRecordsSerializer
# READ SERIALIZERS

def _content_ob_serializer( content, mini_serializer = False):
    if not content:
        return None
    if hasattr(content, "next_of_kin"):
        return IndividualSerializer(content).data if not mini_serializer else MiniIndividualSerializer(content).data
    return CompanySerializer(content).data if not mini_serializer else MiniCompanySerializer(content).data

class TradeReferencesSerializer(serializers.ModelSerializer):
    payment_trend_display = serializers.CharField(source="get_payment_trend_display", read_only=True)

    class Meta:
        model = TradeReferences
        fields = [
            "id",
            "report",
            "referenced_date",
            "name",
            "contact_info",
            "reference_source",
            "position",
            "credit_limit",
            "credit_terms",
            "payment_trend",
            "payment_trend_display",
            "created_at",
            "updated_at",
        ]


class ReportSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportSummary
        fields = [
            "id",
            "report",
            "overall_risk_rating",
            "summary",
            "created_at",
            "updated_at",
        ]

class ReportSerializer(serializers.ModelSerializer):
    client = serializers.SerializerMethodField()
    subject = serializers.SerializerMethodField()
    references  = TradeReferencesSerializer(many = True, read_only=True, source = 'references_report')
    credit_records = CreditRecordsSerializer(read_only = True) 
    report_summary = ReportSummarySerializer(read_only = True, source = "reportsummary_report")

    class Meta:
        model = Report
        fields = [
            'id',
            'enquiry_reference',
            'client',
            'subject',
            'references',
            'credit_records',
            'report_summary',
            'created_at',
            'updated_at'
        ]
    
    def get_client(self, obj):
        return _content_ob_serializer(obj.client)

    def get_subject(self, obj):
        return _content_ob_serializer(obj.subject, True)

class ListReportSerializer(serializers.ModelSerializer):
    client = serializers.SerializerMethodField()
    subject = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'enquiry_reference',
            'client',
            'subject',
            'created_at',
            'updated_at'
        ]

    def get_client(self, obj):
        return _content_ob_serializer(obj.client, True)

    def get_subject(self, obj):
        return _content_ob_serializer(obj.subject, True)
    
# WRITE SERIALIZERS
class TradeReferencesWriteSerializer(serializers.ModelSerializer):
    payment_trend = serializers.ChoiceField(
        choices=TradeReferences.PaymentTrend.choices,
        required=False
    )

    class Meta:
        model = TradeReferences
        fields = [
            "report",
            "name",
            "contact_info",
            "reference_source",
            "position",
            "credit_limit",
            "credit_terms",
            "payment_trend",
        ]


class ReportSummaryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportSummary
        fields = [
            "report",
            "overall_risk_rating",
            "summary",
        ]
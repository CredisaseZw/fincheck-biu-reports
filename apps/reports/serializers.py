from rest_framework import serializers
from apps.utils.mini_serializers import MiniCompanySerializer, MiniIndividualSerializer
from apps.companies.serializers import CompanySerializer
from apps.individuals.serializers import IndividualSerializer
from .models import Report
from apps.credit_records.serializers import CreditRecordsSerializer
# READ SERIALIZERS

def _content_ob_serializer( content, mini_serializer = False):
    if not content:
        return None
    if hasattr(content, "next_of_kin"):
        return IndividualSerializer(content).data if not mini_serializer else MiniIndividualSerializer(content).data
    return CompanySerializer(content).data if not mini_serializer else MiniCompanySerializer(content).data

class ReportSerializer(serializers.ModelSerializer):
    credit_records = CreditRecordsSerializer(read_only=True)

    class Meta:
        model = Report
        fields = [
            'id',
            'enquiry_reference',
            'client',
            'subject',
            'status',
            'overall_risk_rating',
            'summary',
            'credit_records',
            'report_summary',
            'created_at',
            'updated_at',
            'finalized_at'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        client_data = _content_ob_serializer(instance.client, True)
        subject_data = _content_ob_serializer(instance.subject)

        data['client'] = client_data
        data['subject'] = subject_data
        data['client_type'] = 'individual' if client_data and 'national_id' in client_data else 'company'
        data['subject_type'] = 'individual' if subject_data and 'national_id' in subject_data else 'company'

        return data
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
            'status',
            'overall_risk_rating',
            'created_at',
            'updated_at'
        ]

    def get_client(self, obj):
        return _content_ob_serializer(obj.client, True)

    def get_subject(self, obj):
        return _content_ob_serializer(obj.subject, True)
    
# WRITE SERIALIZERS
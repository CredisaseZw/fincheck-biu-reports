from rest_framework import serializers
from apps.utils.mini_serializers import MiniCompanySerializer, MiniIndividualSerializer
from apps.companies.serializers import CompanySerializer
from apps.individuals.serializers import IndividualSerializer
from .models import Report
from apps.utils.helpers import _content_ob_serializer
# READ SERIALIZERS

class ReportSerializer(serializers.ModelSerializer):
    is_stale = serializers.BooleanField(read_only=True)

    class Meta:
        model = Report
        fields = [
            'id',
            'enquiry_reference',
            'client',
            'subject',
            'username',
            'status',
            'is_stale',
            'suspension_reason',
            'overall_risk_rating',
            'summary',
            'created_at',
            'updated_at',
            'finalized_at',
            'report_pdf',
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
    is_stale = serializers.BooleanField(read_only=True)
    class Meta:
        model = Report
        fields = [
            'id',
            'enquiry_reference',
            'client',
            'username',
            'subject',
            'status',
            'is_stale',
            'suspension_reason',
            'report_pdf',
            'overall_risk_rating',
            'created_at',
            'updated_at'
        ]
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        client_data = _content_ob_serializer(instance.client, True)
        subject_data = _content_ob_serializer(instance.subject, True)

        data['client'] = client_data
        data['subject'] = subject_data
        data['client_type'] = 'individual' if client_data and 'national_id' in client_data else 'company'
        data['subject_type'] = 'individual' if subject_data and 'national_id' in subject_data else 'company'

        return data

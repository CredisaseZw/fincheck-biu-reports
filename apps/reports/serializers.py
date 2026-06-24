from rest_framework import serializers
from apps.utils.mini_serializers import MiniCompanySerializer, MiniIndividualSerializer
from apps.companies.serializers import CompanySerializer
from apps.individuals.serializers import IndividualSerializer
from .models import Report
from apps.utils.helpers import _content_ob_serializer
# READ SERIALIZERS

class ReportSerializer(serializers.ModelSerializer):
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
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        client_data = _content_ob_serializer(instance.client, True)
        subject_data = _content_ob_serializer(instance.subject)

        data['client'] = client_data
        data['subject'] = subject_data
        data['client_type'] = 'individual' if client_data and 'national_id' in client_data else 'company'
        data['subject_type'] = 'individual' if subject_data and 'national_id' in subject_data else 'company'

        return data

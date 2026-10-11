from rest_framework import serializers
from apps.utils.mini_serializers import MiniCompanySerializer, MiniIndividualSerializer
from apps.companies.serializers import CompanySerializer
from apps.individuals.serializers import IndividualSerializer
from .models import Report
from apps.utils.helpers import _content_ob_serializer
# READ SERIALIZERS

class UpdateReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            'id',
            'username',
            'username_mobile',
            'status',
            'is_stale',
            'last_report',
            'contact_person',
            'analyst',
            'suspension_reason',
            'overall_risk_rating',
            'summary',
            'report_narration',
            'report_date',
            'report_pdf',
        ]
        
class ReportSerializer(serializers.ModelSerializer):
    analyst_name = serializers.SerializerMethodField()
    is_stale = serializers.BooleanField(read_only=True)
    class Meta:
        model = Report
        fields = [
            'id',
            'analyst',
            'analyst_name',
            'enquiry_reference',
            'client',
            'subject',
            'username',
            'username_mobile',
            'status',
            'is_stale',
            'last_report',
            'contact_person',
            'suspension_reason',
            'overall_risk_rating',
            'summary',
            'report_narration',
            'report_date',
            'created_at',
            'updated_at',
            'finalized_at',
            'report_pdf',
        ]
    def get_analyst_name(self, instance):
        if instance.analyst:
            return instance.analyst.get_full_name()
        return None
        
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
    analyst_name = serializers.SerializerMethodField()
    class Meta:
        model = Report
        fields = [
            'id',
            'report_narration',
            'enquiry_reference',
            'client',
            'analyst_name',
            'contact_person',
            'username',
            'username_mobile',
            'subject',
            'status',
            'is_stale',
            'suspension_reason',
            'report_pdf',
            'overall_risk_rating',
            'finalized_at',
            'report_date',
            'created_at',
            'updated_at'
        ]
    def get_analyst_name(self, instance):
        if instance.analyst:
            return instance.analyst.get_full_name()
        return None
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        client_data = _content_ob_serializer(instance.client, True)
        subject_data = _content_ob_serializer(instance.subject, True)

        data['client'] = client_data
        data['subject'] = subject_data
        data['client_type'] = 'individual' if client_data and 'national_id' in client_data else 'company'
        data['subject_type'] = 'individual' if subject_data and 'national_id' in subject_data else 'company'

        return data

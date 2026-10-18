from rest_framework import serializers
from .models import Report
from apps.utils.helpers import _content_ob_serializer
import calendar
from apps.utils.helpers import cycle_bounds, entity_name

# READ SERIALIZERS

MONTHS = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
]
class ReportListQuerySerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=["month", "period_month"])
    report_selection = serializers.ChoiceField(choices=["client", "subject"])
    entity_value = serializers.CharField(default="all", allow_blank=True)

    month_year = serializers.IntegerField(required=False, min_value=2000, max_value=2100)
    month_month = serializers.ChoiceField(choices=MONTHS, required=False)

    period_year = serializers.IntegerField(required=False, min_value=2000, max_value=2100)
    period_from = serializers.ChoiceField(choices=MONTHS, required=False)
    period_to = serializers.ChoiceField(choices=MONTHS, required=False)

    def validate_entity_value(self, value):
        value = value.strip()
        return "all" if value.lower() in ("", "all") else value

    def validate(self, a):
        def label(y, m):
            return f"{calendar.month_abbr[m]}-{str(y)[2:]}"

        if a["mode"] == "month":
            if not (a.get("month_year") and a.get("month_month")):
                raise serializers.ValidationError("month_year and month_month are required.")
            y, m = a["month_year"], MONTHS.index(a["month_month"]) + 1
            a["start"], a["end"] = cycle_bounds(y, m)
            a["label"] = label(y, m)
        else:
            if not (a.get("period_year") and a.get("period_from") and a.get("period_to")):
                raise serializers.ValidationError("period_year, period_from and period_to are required.")
            y = a["period_year"]
            f, t = MONTHS.index(a["period_from"]) + 1, MONTHS.index(a["period_to"]) + 1
            if f > t:
                raise serializers.ValidationError("period_from must not be after period_to.")
            a["start"] = cycle_bounds(y, f)[0]
            a["end"] = cycle_bounds(y, t)[1]
            a["label"] = f"{label(y, f)} – {label(y, t)}"

        a["entity_term"] = None if a["entity_value"] == "all" else a["entity_value"]
        return a

class ReportRowSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    enquiry_reference = serializers.CharField()
    name = serializers.SerializerMethodField()
    report_date = serializers.DateTimeField(source="sort_date")

    def get_name(self, obj):
        return entity_name(getattr(obj, self.context["other"]))


class ReportGroupSerializer(serializers.Serializer):
    entity_id = serializers.IntegerField()
    name = serializers.CharField()
    count = serializers.IntegerField()
    reports = ReportRowSerializer(many=True)

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


class ReportListItemInSerializer(serializers.Serializer):
    enquiry_reference = serializers.CharField(max_length=20)
    name = serializers.CharField(max_length=255)
    report_date = serializers.DateTimeField()


class ReportListGroupInSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    reports = ReportListItemInSerializer(many=True, allow_empty=False)


class ReportListPDFRequestSerializer(serializers.Serializer):
    group_by = serializers.ChoiceField(choices=["client", "subject"])
    label = serializers.CharField(max_length=40)
    groups = ReportListGroupInSerializer(many=True, allow_empty=False, max_length=200)
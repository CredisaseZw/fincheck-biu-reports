import django_filters
from .models import Report

class ReportsFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(method="filter_by_status")
    date_from = django_filters.DateFilter(field_name="created_at", lookup_expr="date__gte")
    date_to = django_filters.DateFilter(field_name="created_at", lookup_expr="date__lte")
    finalized_from = django_filters.DateFilter(field_name="finalized_at", lookup_expr="date__gte")
    finalized_to = django_filters.DateFilter(field_name="finalized_at", lookup_expr="date__lte")

    class Meta:
        model = Report
        fields = ["status", "date_from", "date_to", "finalized_from", "finalized_to"]

    def filter_by_status(self, queryset, name, value):
        if value == "live":
            return queryset.exclude(status=Report.StatusChoices.FINALIZED)

        elif value in [
            Report.StatusChoices.DRAFT,
            Report.StatusChoices.IN_PROGRESS,
            Report.StatusChoices.SUSPENDED,
            Report.StatusChoices.FINALIZED,
        ]:
            return queryset.filter(status=value)
        return queryset
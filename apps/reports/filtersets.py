import django_filters
from .models import Report

class ReportsFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(method="filter_by_status")

    class Meta:
        model = Report
        fields = ["status"]

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
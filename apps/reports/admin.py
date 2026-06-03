from django.contrib import admin

from apps.reports.models import Report, ReportSummary, TradeReferences


class TradeReferencesInline(admin.StackedInline):
    model = TradeReferences
    extra = 0
    max_num = 1


class ReportSummaryInline(admin.StackedInline):
    model = ReportSummary
    extra = 0
    max_num = 1


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        "enquiry_reference",
        "client",
        "subject_content_type",
        "subject_object_id",
        "created_at",
    )
    list_filter = ("subject_content_type",)
    search_fields = ("enquiry_reference",)
    readonly_fields = ("enquiry_reference", "created_at", "updated_at")
    inlines = (TradeReferencesInline, ReportSummaryInline)


@admin.register(TradeReferences)
class TradeReferencesAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "report",
        "referenced_date",
        "payment_trend",
        "credit_limit",
        "credit_terms",
    )
    list_filter = ("payment_trend",)
    search_fields = ("name", "contact_info", "reference_source")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("report",)


@admin.register(ReportSummary)
class ReportSummaryAdmin(admin.ModelAdmin):
    list_display = ("report", "overall_risk_rating", "created_at")
    list_filter = ("overall_risk_rating",)
    search_fields = ("summary", "report__enquiry_reference")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("report",)

from django.contrib import admin
from apps.reports.models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        "enquiry_reference",
        "client",
        "subject",
        "status",
        "overall_risk_rating",
        "finalized_at",
        "created_at",
    )
    list_filter = ("status", "overall_risk_rating", "created_at", "finalized_at")
    search_fields = ("enquiry_reference", "summary")
    readonly_fields = ("enquiry_reference", "created_at", "updated_at")

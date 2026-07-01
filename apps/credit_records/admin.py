from django.contrib import admin
from apps.credit_records.models import (
    Claims,
    Absconders,
    CourtJudgement,
    InsolvencyRecord,
    PublicInformation
)

@admin.register(Claims)
class ClaimsAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "creditor_name",
        "currency",
        "amount",
        "claim_date",
        "status",
        "subject_content_type",
        "subject_object_id",
    )
    list_filter = ("currency", "status", "claim_date")
    search_fields = ("creditor_name", "amount")
    readonly_fields = ("created_at", "updated_at")

@admin.register(Absconders)
class AbscondersAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "creditor_name",
        "currency",
        "amount",
        "start_date",
        "status",
        "subject_content_type",
        "subject_object_id",
    )
    list_filter = ("currency", "status", "start_date")
    search_fields = ("creditor_name", "amount")
    readonly_fields = ("created_at", "updated_at")

@admin.register(CourtJudgement)
class CourtJudgementAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "court_name",
        "case_number",
        "currency",
        "amount",
        "judgement_date",
        "subject_content_type",
        "subject_object_id",
    )
    list_filter = ("currency", "judgement_date")
    search_fields = ("court_name", "case_number", "amount")
    readonly_fields = ("created_at", "updated_at")

@admin.register(InsolvencyRecord)
class InsolvencyRecordAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "insolvency_type",
        "start_date",
        "end_date",
        "court_reference",
        "subject_content_type",
        "subject_object_id",
    )
    list_filter = ("insolvency_type", "start_date", "end_date")
    search_fields = ("court_reference",)
    readonly_fields = ("created_at", "updated_at")

@admin.register(PublicInformation)
class PublicInformationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "record_date",
        "summary",
        "link",
        "subject_content_type",
        "subject_object_id",
    )
    list_filter = ("record_date",)
    search_fields = ("summary", "link")
    readonly_fields = ("created_at", "updated_at")

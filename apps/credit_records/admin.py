from django.contrib import admin

from apps.credit_records.models import (
    Absconders,
    Claims,
    CourtJudgement,
    InsolvencyRecord,
    PublicInformation,
)


class BaseFinancialRecordAdmin(admin.ModelAdmin):
    list_display = (
        "creditor_name",
        "amount",
        "currency",
        "status",
        "report",
        "created_at",
    )
    list_filter = ("status", "currency")
    search_fields = ("creditor_name",)
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("report",)


@admin.register(Claims)
class ClaimsAdmin(BaseFinancialRecordAdmin):
    list_display = BaseFinancialRecordAdmin.list_display + ("claim_date",)
    date_hierarchy = "claim_date"


@admin.register(Absconders)
class AbscondersAdmin(BaseFinancialRecordAdmin):
    list_display = BaseFinancialRecordAdmin.list_display + ("start_date",)
    date_hierarchy = "start_date"


@admin.register(CourtJudgement)
class CourtJudgementAdmin(admin.ModelAdmin):
    list_display = (
        "court_name",
        "case_number",
        "judgement_date",
        "amount",
        "report",
        "created_at",
    )
    list_filter = ("court_name",)
    search_fields = ("court_name", "case_number")
    date_hierarchy = "judgement_date"
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("report",)


@admin.register(InsolvencyRecord)
class InsolvencyRecordAdmin(admin.ModelAdmin):
    list_display = (
        "insolvency_type",
        "start_date",
        "end_date",
        "court_reference",
        "report",
        "created_at",
    )
    list_filter = ("insolvency_type",)
    search_fields = ("court_reference",)
    date_hierarchy = "start_date"
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("report",)


@admin.register(PublicInformation)
class PublicInformationAdmin(admin.ModelAdmin):
    list_display = ("record_date", "summary", "link", "report", "created_at")
    search_fields = ("summary", "link")
    date_hierarchy = "record_date"
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("report",)

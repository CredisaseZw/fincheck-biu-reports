from django.contrib import admin
from apps.common.models import (
    BankerAccounts,
    TradeReferences,
    Financials,
    ProfessionalPartners,
    RegistrationAccounts,
)
class GenericSubjectMixin:
    @admin.display(description="Subject")
    def get_subject(self, obj):
        if getattr(obj, "subject", None):
            return f"{obj.subject.__class__.__name__} | {str(obj.subject)}"
        return "-"

@admin.register(RegistrationAccounts)
class RegistrationAccountsAdmin(GenericSubjectMixin, admin.ModelAdmin):
    list_display = (
        "get_subject",
        "tin_number",
        "vat_number",
        "nssa_number",
        "praz_number",
        "is_tin_verified",
        "is_vat_verified",
        "created_at",
    )
    list_filter = (
        "is_tin_verified",
        "is_vat_verified",
        "is_nssa_verified",
        "is_praz_verified",
    )
    search_fields = ("tin_number", "vat_number", "nssa_number", "praz_number")
    readonly_fields = ("created_at", "updated_at")


@admin.register(BankerAccounts)
class BankerAccountsAdmin(GenericSubjectMixin, admin.ModelAdmin):
    list_display = (
        "get_subject",
        "bank",
        "branch",
        "account_name",
        "account_type",
        "account_number",
        "created_at",
    )
    list_filter = ("account_type", "bank")
    search_fields = ("bank", "branch", "account_name", "account_number")
    readonly_fields = ("created_at", "updated_at")

@admin.register(ProfessionalPartners)
class ProfessionalPartnersAdmin(GenericSubjectMixin, admin.ModelAdmin):
    list_display = ("get_subject", "created_at")
    readonly_fields = ("created_at", "updated_at")

@admin.register(Financials)
class FinancialsAdmin(GenericSubjectMixin, admin.ModelAdmin):
    list_display = (
        "get_subject",
        "financial_year",
        "total_assets",
        "net_profit",
        "net_worth",
        "total_revenue",
        "financials_file",
        "created_at",
    )
    list_filter = ("financial_year",)
    readonly_fields = ("created_at", "updated_at")

@admin.register(TradeReferences)
class TradeReferencesAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "referenced_date",
        "payment_trend",
        "credit_limit",
        "credit_terms",
    )
    list_filter = ("payment_trend",)
    search_fields = ("name", "contact_info", "reference_source")
    readonly_fields = ("created_at", "updated_at")

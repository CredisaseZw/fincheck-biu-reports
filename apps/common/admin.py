from django.contrib import admin
from apps.common.models import (
    BankerAccounts,
    TradeReferences,
    Financials,
    ProfessionalPartners,
    RegistrationAccounts,
)
class GenericClientMixin:
    @admin.display(description="Client")
    def get_client(self, obj):
        if obj.client:
            return f"{obj.client.__class__.__name__} | {str(obj.client)}"
        return "-"

@admin.register(RegistrationAccounts)
class RegistrationAccountsAdmin(GenericClientMixin, admin.ModelAdmin):
    list_display = (
        "get_client",
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
class BankerAccountsAdmin(GenericClientMixin, admin.ModelAdmin):
    list_display = (
        "get_client",
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
class ProfessionalPartnersAdmin(GenericClientMixin, admin.ModelAdmin):
    list_display = ("get_client", "created_at")
    readonly_fields = ("created_at", "updated_at")

@admin.register(Financials)
class FinancialsAdmin(GenericClientMixin, admin.ModelAdmin):
    list_display = (
        "get_client",
        "financial_year",
        "total_assets",
        "net_profit",
        "net_worth",
        "total_revenue",
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

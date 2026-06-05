from django.contrib import admin

from apps.common.models import (
    BankerAccounts,
    Financials,
    ProfessionalPartners,
    RegistrationAccounts,
)

@admin.register(RegistrationAccounts)
class RegistrationAccountsAdmin(admin.ModelAdmin):
    list_display = (
        "client",
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
class BankerAccountsAdmin(admin.ModelAdmin):
    list_display = (
        "client",
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
class ProfessionalPartnersAdmin(admin.ModelAdmin):
    list_display = ("client", "created_at")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Financials)
class FinancialsAdmin(admin.ModelAdmin):
    list_display = (
        "client",
        "financial_year",
        "total_assets",
        "net_profit",
        "net_worth",
        "total_revenue",
        "created_at",
    )
    list_filter = ("financial_year",)
    readonly_fields = ("created_at", "updated_at")

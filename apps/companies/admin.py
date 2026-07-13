from django.contrib import admin
from apps.companies.models import (
    Company,
    CompanyOverview,
    CompanyStructure,
    CompanyOperations
)

class CompanyOverviewInline(admin.StackedInline):
    model = CompanyOverview
    extra = 0

class CompanyStructureInline(admin.StackedInline):
    model = CompanyStructure
    extra = 0

class CompanyOperationsInline(admin.StackedInline):
    model = CompanyOperations
    extra = 0

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = (
        "registered_name",
        "trading_name",
        "registration_number",
        "date_of_registration",
        "refer_type",
        "email",
        "telephone_number",
        "mobile_number",
        "is_company_verified",
        "is_active",
    )
    list_filter = ("refer_type", "is_company_verified", "is_active", "site_ownership", "location")
    search_fields = (
        "registered_name",
        "trading_name",
        "registration_number",
        "email",
        "telephone_number",
        "mobile_number",
    )
    readonly_fields = ("created_at", "updated_at")
    inlines = (CompanyOverviewInline, CompanyStructureInline, CompanyOperationsInline)

@admin.register(CompanyOverview)
class CompanyOverviewAdmin(admin.ModelAdmin):
    list_display = (
        "company",
        "trading_status",
        "legal_form",
        "condition",
        "trend",
        "number_of_employees",
    )
    list_filter = ("trading_status", "legal_form", "condition", "trend")
    search_fields = ("company__registered_name", "company__trading_name")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("company",)

@admin.register(CompanyStructure)
class CompanyStructureAdmin(admin.ModelAdmin):
    list_display = ("company", "holding_company", "subsidiaries", "branches")
    search_fields = ("company__registered_name", "holding_company", "subsidiaries", "branches")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("company",)

@admin.register(CompanyOperations)
class CompanyOperationsAdmin(admin.ModelAdmin):
    list_display = (
        "company",
        "industry",
        "purchases_payment_terms",
        "sales_payment_terms",
        "purchase_supplier_scope",
    )
    list_filter = ("purchases_payment_terms", "sales_payment_terms", "purchase_supplier_scope")
    search_fields = ("company__registered_name", "industry")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("company",)

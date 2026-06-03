from django.contrib import admin

from apps.companies.models import (
    Company,
    CompanyOperations,
    CompanyOverview,
    CompanyStructure,
)


class CompanyOverviewInline(admin.StackedInline):
    model = CompanyOverview
    extra = 0
    max_num = 1


class CompanyStructureInline(admin.StackedInline):
    model = CompanyStructure
    extra = 0
    max_num = 1


class CompanyOperationsInline(admin.StackedInline):
    model = CompanyOperations
    extra = 0
    max_num = 1


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = (
        "registered_name",
        "trading_name",
        "refer_type",
        "email",
        "telephone_number",
        "is_verified",
        "is_active",
        "created_at",
    )
    list_filter = ("refer_type", "is_verified", "is_active", "is_deleted")
    search_fields = (
        "registered_name",
        "trading_name",
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
        "date_of_registration",
    )
    list_filter = ("trading_status", "legal_form", "condition", "trend")
    search_fields = ("company__registered_name", "company__trading_name")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("company",)


@admin.register(CompanyStructure)
class CompanyStructureAdmin(admin.ModelAdmin):
    list_display = ("company", "created_at")
    search_fields = ("company__registered_name", "company__trading_name")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("company",)


@admin.register(CompanyOperations)
class CompanyOperationsAdmin(admin.ModelAdmin):
    list_display = ("company", "industry", "updated_at")
    list_filter = ("industry",)
    search_fields = ("company__registered_name", "company__trading_name", "industry")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("company",)

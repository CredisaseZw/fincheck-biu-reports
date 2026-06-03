from django.contrib import admin

from apps.directors.models import CompanyDirector


@admin.register(CompanyDirector)
class CompanyDirectorAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "company",
        "position",
        "gender",
        "email",
        "mobile_phone_number",
        "created_at",
    )
    list_filter = ("position", "gender")
    search_fields = (
        "full_name",
        "email",
        "mobile_phone_number",
        "company__registered_name",
        "company__trading_name",
    )
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("company",)

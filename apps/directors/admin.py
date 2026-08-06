from django.contrib import admin
from apps.directors.models import CompanyDirector
@admin.register(CompanyDirector)
class CompanyDirectorAdmin(admin.ModelAdmin):
    list_display = (
        "individual__full_name",
        "company",
        "position",
        "individual__gender",
        "individual__email",
        "individual__mobile_number",
        "created_at",
    )
    list_filter = ("position", "individual__gender")
    search_fields = (
        "individual__full_name",
        "individual__email",
        "individual__mobile_number",
        "company__registered_name",
        "company__trading_name",
    )
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("company",'individual')

from django.contrib import admin
from apps.individuals.models import EmploymentInformation, Individuals, NextOfKin

class EmploymentInformationInline(admin.TabularInline):
    model = EmploymentInformation
    extra = 0
class NextOfKinInline(admin.TabularInline):
    model = NextOfKin
    extra = 0
@admin.register(Individuals)
class IndividualsAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "national_id",
        "date_of_birth",
        "gender",
        "marital_status",
        "nationality",
        "mobile_number",
        "refer_type",
    )
    list_filter = ("gender", "marital_status", "refer_type", "nationality")
    search_fields = (
        "full_name",
        "national_id",
        "email",
        "mobile_number",
    )
    readonly_fields = ("created_at", "updated_at")
    inlines = (EmploymentInformationInline, NextOfKinInline)
@admin.register(EmploymentInformation)
class EmploymentInformationAdmin(admin.ModelAdmin):
    list_display = (
        "individual",
        "employer",
        "position",
        "employment_status",
        "years_employed",
        "monthly_income",
    )
    list_filter = ("employment_status",)
    search_fields = (
        "employer",
        "position",
        "individual__full_name",
        "individual__national_id",
    )
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("individual",)
@admin.register(NextOfKin)
class NextOfKinAdmin(admin.ModelAdmin):
    list_display = ("name", "individual", "relationship", "contact_number")
    list_filter = ("relationship",)
    search_fields = ("name", "contact_number", "individual__full_name")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("individual",)

from django.contrib import admin
from apps.shareholding.models import CompanyShareholding, Shareholder

class ShareholderInline(admin.TabularInline):
    model = Shareholder
    extra = 0


@admin.register(CompanyShareholding)
class CompanyShareholdingAdmin(admin.ModelAdmin):
    list_display = (
        "company",
        "issued_share_capital",
        "authorized_capital",
        "numbers_of_shareholders",
        "created_at",
    )
    search_fields = (
        "company__registered_name",
        "company__trading_name",
    )
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("company",)
    inlines = (ShareholderInline,)


@admin.register(Shareholder)
class ShareholderAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "shareholding",
        "number_of_shares",
        "percentage_ownership",
        "created_at",
    )
    search_fields = (
        "full_name",
        "shareholding__company__registered_name",
        "shareholding__company__trading_name",
    )
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("shareholding",)

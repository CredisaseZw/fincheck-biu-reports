from django.db import models
from django.db import transaction
from apps.reports.models import Report
from django.db.models import UniqueConstraint
from django.contrib.contenttypes.fields import GenericRelation
from apps.utils.base_models import BaseModel
from django.utils.translation import gettext_lazy as _
from apps.common.models import (
    RegistrationAccounts,
    BankerAccounts,
    ProfessionalPartners,
    Financials
)
class Company(BaseModel):
    class ReferType(models.TextChoices):
        BIU = "biu", "BIU"
        FP3 = "fp3", "FP3"
        RENTSAFE = "rentsafe", "Rentsafe"

    registered_name = models.CharField(
        max_length=50,
        help_text=_("")
    )
    trading_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_(
            "The name the company trades under, if different from registration name."
        ),
    )
    refer_type = models.CharField(
        max_length=10,
        choices= ReferType.choices,
        help_text=_("Where was company data retrieved from, default is BIU."),
        default= ReferType.BIU
    )
    address_registered = models.TextField()
    address_operations = models.TextField()
    
    #contact details
    email = models.EmailField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_("General email address for the company."),
    )
    telephone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text=_("General telephone number for the company."),
    )
    mobile_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text=_("General phone number for the company."),
    )
    website = models.URLField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_("Website link for the branch."),
    )
    
    # GENERIC RELATIONS
    registration_accounts = GenericRelation(
        RegistrationAccounts,
        content_type_field="client_content_type",
        object_id_field="client_object_id"
    ) 
    banker_accounts = GenericRelation(
        BankerAccounts,
        content_type_field="client_content_type",
        object_id_field="client_object_id"
    )
    professional_partners = GenericRelation(
        ProfessionalPartners,
        content_type_field="client_content_type",
        object_id_field="client_object_id"
    )
    financials = GenericRelation(
        Financials,
        content_type_field="client_content_type",
        object_id_field="client_object_id"
    )
    reports_as_client = GenericRelation(
        Report,
        content_type_field="client_content_type",
        object_id_field="client_object_id"
    ) # REVERSE LOOKUP company.reports_as_client.all()
    
    reports_as_subject = GenericRelation(
        Report,
        content_type_field="subject_content_type",
        object_id_field="subject_object_id"
    )

    is_address_registered_verified  = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)  

    class Meta:
        app_label = "companies"
        db_table = "companies"
        verbose_name = _("company")
        verbose_name_plural = _("Companies")        
        constraints = [
            UniqueConstraint(
                fields=['registered_name', 'trading_name'],
                name='unique_name_per_trading_name'
            )
        ]
    
    @property
    def company_name(self):
        return f"{self.registered_name} | {self.trading_name or '-'}"

    def __str__(self):
        return self.company_name
    
class CompanyOverview(BaseModel):
    class TradingStatus(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        SUSPENDED = "suspended", "Suspended"

    class LegalForm(models.TextChoices):
        LLC = "llc", "LLC"
        PLC = "plc", "PLC"
        SOLE_TRADER = "sole_trader", "Sole Trader"
        PARTNERSHIP = "partnership", "Partnership"

    class Condition(models.TextChoices):
        GOOD = "good", "Good"
        FAIR = "fair", "Fair"
        POOR = "poor", "Poor"

    class Trend(models.TextChoices):
        IMPROVING = "improving", "Improving"
        STABLE = "stable", "Stable"
        DECLINING = "declining", "Declining"
    
    company = models.OneToOneField(
        Company,
        related_name="overview",
        on_delete=models.CASCADE
    )
    trading_status = models.CharField(
        max_length=20,
        choices=TradingStatus.choices,
        null=True,
        blank=True
    )
    date_of_registration = models.DateField(
        null=True,
        blank=True
    )
    legal_form = models.CharField(
        max_length=20,
        choices=LegalForm.choices,
        null=True,
        blank=True
    )
    condition = models.CharField(
        max_length=20,
        choices=Condition.choices,
        blank=True,
        null=True,

    )
    trend = models.CharField(
        max_length=20,
        choices=Trend.choices,
        null=True,
        blank=True
    )
    number_of_employees = models.PositiveIntegerField(
        null=True,
        blank=True
    )
    last_financial_result = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    net_asset_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    authorized_share_capital = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    issued_share_capital = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"Company overview for {self.company.company_name}" 
    
    class Meta:
        app_label = "companies"
        db_table = "company_overview"
        verbose_name = _("Company Overview")
        verbose_name_plural = _("Company Overviews")
        ordering = ["-created_at"]

class CompanyStructure(BaseModel):
    company = models.OneToOneField(
        Company,
        on_delete=models.CASCADE,
        related_name="structure"
    )
    holding_company = models.TextField(blank=True, help_text=_("Holding company name"))
    subsidiaries = models.TextField(blank=True, help_text=_("List of subsidiaries"))
    associated_companies = models.TextField(blank=True, help_text=_("List of associated companies"))
    divisions = models.TextField(blank=True, help_text=_("List of divisions"))
    branches = models.TextField(blank=True, help_text=_("List of branches"))

    class Meta:
        verbose_name = "Company Structure"
        verbose_name_plural = "Company Structures"

    def __str__(self):
        return f"Structure of {self.company}"

class CompanyOperations(BaseModel):
    company = models.OneToOneField(
        Company,
        on_delete=models.CASCADE,
        related_name="operations"
    )
    industry = models.CharField(max_length=255, blank=True)
    target_markets = models.TextField(blank=True)
    operations_territories = models.TextField(blank=True)
    property_ownership = models.TextField(blank=True)
    operational_areas = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Company Operations"
        verbose_name_plural = "Company Operations"

    def __str__(self):
        return f"Operations of {self.company}"


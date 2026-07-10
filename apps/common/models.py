from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.utils.base_models import BaseModelWithSubject
import os
import uuid
from django.conf import settings
# Create your models here.
class RegistrationAccounts(BaseModelWithSubject):
    tin_number = models.CharField(
        max_length=50,
        blank=True,
        null = True,
        help_text=_("Account tin number")   
    )
    vat_number = models.CharField(
        max_length=50,
        blank=True,
        null = True,
        help_text=_("Account vat number")   
    )
    nssa_number = models.CharField(
        max_length=50,
        blank=True,
        null = True,
        help_text=_("Account nssa number")   
    )
    praz_number = models.CharField(
        max_length=50,
        blank=True,
        null = True,
        help_text=_("Account praz number")   
    )
    is_praz_verified = models.BooleanField(default=False)
    is_nssa_verified = models.BooleanField(default=False)
    is_vat_verified = models.BooleanField(default=False)
    is_tin_verified = models.BooleanField(default=False)

    class Meta:
        db_table = "registration_accounts"
        verbose_name = "Registration Account"
        verbose_name_plural = "Registration Accounts"
        constraints = [
            models.UniqueConstraint(
                fields=["subject_content_type", "subject_object_id"],
                name="unique_registration_accounts_per_subject"
            )
        ]


    def __str__(self):
        return f"{self.subject} | {self.tin_number}"

class BankerAccounts(BaseModelWithSubject):
    class AccountType(models.TextChoices):
        CURRENT = "current", "Current"
        SAVINGS = "savings", "Savings"
        LOAN = "loan", "Loan"
        FIXED_DEPOSIT = "fixed_deposit", "Fixed Deposit"
    class Narrations(models.TextChoices):
        A = "A", "Very Good Credit Worthiness (Lowest Risk)"
        B = "B", "Good Credit Worthiness (Low Risk)"
        C = "C", "Satisfactory Credit Worthiness (Moderate Risk)"
        D = "D", "No Credit Worthy"
        E = "E", "Rating Suspended"
    class Currency(models.TextChoices):
        USD = "USD", "US Dollar"
        ZIG = "ZiG", "Zimbabwe Gold"
        AUD = "AUD", "Australian Dollar"
        CAD = "CAD", "Canadian Dollar"
        CHF = "CHF", "Swiss Franc"
        ZAR = "ZAR", "South African Rand"
    
    bank = models.CharField(max_length=255)
    branch = models.CharField(max_length=255, blank=True)
    account_name = models.CharField(max_length=255)
    account_currency = models.CharField(
        max_length=5,
        choices=Currency.choices,
        default=Currency.USD
    )
    account_type = models.CharField(
        max_length=20,
        choices=AccountType.choices,
    )
    account_number = models.CharField(max_length=50)
    date_of_acquirement = models.DateField(auto_now=True)
    bank_code = models.CharField(
        max_length=10,
        blank=True,
        null=True
    )
    narration = models.CharField(
        max_length=2,
        choices=Narrations.choices,
        default=Narrations.A
    )

    class Meta:

        db_table ="bank_accounts"
        verbose_name = "Banker Account"
        verbose_name_plural = "Banker Accounts"

    def __str__(self):
        return f"{self.subject} | {self.account_name} ({self.account_number})"

class ProfessionalPartners(BaseModelWithSubject): #PUSH TO COMMON 
    auditors = models.TextField()
    lawyers = models.TextField()
    
    class Meta:
        app_label = "common"
        db_table = "professional_partners"
        verbose_name = _("Professional Partner")
        verbose_name_plural = _("Professional Partners")
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["subject_content_type", "subject_object_id"],
                name="unique_professional_partners_per_subject"
            )
        ]


class Financials(BaseModelWithSubject):
    def financials_file_path(instance, filename):
        from django.conf import settings
        ext = os.path.splitext(filename)[1]
        return f"{'l' if not settings.DEBUG else 't'}/financials/{uuid.uuid4().hex}{ext}" # l = live, t = test
    
    total_assets = models.DecimalField(
        _("Total Assets"),
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True
    )
    net_profit = models.DecimalField(
        _("Net Profit"),
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True
    )
    net_worth = models.DecimalField(
        _("Net Worth"),
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True
    )
    total_revenue = models.DecimalField(
        _("Total Revenue"),
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True
    )
    asset_ratio = models.DecimalField(
        _("Asset Ratio"),
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True   
    )

    financials_file = models.FileField(
        _("Financials File"),
        upload_to=financials_file_path,
        null=True,
        blank=True
    )
    financial_year = models.PositiveIntegerField(
        _("Financial Year"),
        null=True,
        blank=True
    )
    
    class Meta:
        app_label = "common"
        db_table = "financials"
        verbose_name = _("Financials")
        verbose_name_plural = _("Financials")
        constraints = [
            models.UniqueConstraint(
                fields=["subject_content_type", "subject_object_id"],
                name="unique_financials_per_subject"
            )
        ]

    def __str__(self):
        return f"{self.subject} - {self.financial_year}"
    
class TradeReferences(BaseModelWithSubject):
    class PaymentTrend(models.TextChoices):
        GOOD = "good", "Good"
        FAIR = "fair", "Fair"
        POOR = "poor", "Poor"
        
    referenced_date = models.DateField(auto_now=True)
    name = models.CharField(max_length=100)
    contact_info = models.CharField(max_length=100, blank=True, null=True)
    reference_source = models.CharField(max_length=200, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    credit_limit = models.CharField(max_length=100, blank=True, null=True)
    credit_terms = models.CharField(max_length=100, blank=True, null=True)
    payment_trend = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        choices=PaymentTrend.choices,
    )

    class Meta:
        app_label = "common"
        db_table = "trade_references"
        verbose_name = _("Trade Reference")
        verbose_name_plural = _("Trade Reference")
        ordering = ["-created_at"]
    
    def __str__(self):
        name = self.name or "N/A"
        contact = self.contact_info or "N/A"
        return f"{name} | {contact}"

from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.utils.base_models import BaseModelWithSubject
import os
import uuid
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
    is_praz_verified = models.BooleanField(default=True)
    is_nssa_verified = models.BooleanField(default=True)
    is_vat_verified = models.BooleanField(default=True)
    is_tin_verified = models.BooleanField(default=True)

    class Meta:
        db_table = "registration_accounts"
        verbose_name = "Registration Account"
        verbose_name_plural = "Registration Accounts"

    def __str__(self):
        return f"{self.subject} | {self.tin_number}"

class BankerAccounts(BaseModelWithSubject):
    class AccountType(models.TextChoices):
        CURRENT = "current", "Current"
        SAVINGS = "savings", "Savings"
        LOAN = "loan", "Loan"
        FIXED_DEPOSIT = "fixed_deposit", "Fixed Deposit"

    bank = models.CharField(max_length=255)
    branch = models.CharField(max_length=255, blank=True)
    account_name = models.CharField(max_length=255)
    account_type = models.CharField(max_length=20, choices=AccountType.choices)
    account_number = models.CharField(max_length=50)

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

class Financials(BaseModelWithSubject):
    def financials_file_path(instance, filename):
        ext = os.path.splitext(filename)[1]
        return f"financials/financials_file/{uuid.uuid4()}{ext}"
    
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
    paid_up_capital = models.DecimalField(
        _("Paid Up Capital"),
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True
    )
    authorized_capital = models.DecimalField(
        _("Authorized Capital"),
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

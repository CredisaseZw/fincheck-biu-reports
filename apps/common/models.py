from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.utils.base_models import BaseModelWithClient

# Create your models here.
class RegistrationAccounts(BaseModelWithClient):
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
        return f"{self.client} | {self.tin_number}"


class BankerAccounts(BaseModelWithClient):
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
        return f"{self.client} | {self.account_name} ({self.account_number})"

class ProfessionalPartners(BaseModelWithClient): #PUSH TO COMMON 
    auditors = models.TextField()
    lawyers = models.TextField()
    
    class Meta:
        app_label = "common"
        db_table = "professional_partners"
        verbose_name = _("Professional Partner")
        verbose_name_plural = _("Professional Partners")
        ordering = ["-created_at"]

class Financials(BaseModelWithClient):
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
    profit_and_loss = models.FileField(
        _("Profit and Loss Statement"),
        upload_to="financials/profit_and_loss/",
        null=True,
        blank=True
    )
    statement_of_financial_position = models.FileField(
        _("Statement of Financial Position"),
        upload_to="financials/statement_of_financial_position/",
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
        return f"{self.client} - {self.financial_year}"
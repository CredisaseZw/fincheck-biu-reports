from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.companies.models import Company
from apps.utils.base_models import BaseModel

# Create your models here.
class CompanyShareholding(BaseModel):
    company = models.OneToOneField(
        Company,
        on_delete=models.CASCADE,
        related_name="shareholdings"
    )
    issued_share_capital = models.DecimalField(
         _("Issued Share Capital"),
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True
    )
    numbers_of_shareholders = models.PositiveIntegerField()
    authorized_capital = models.DecimalField(
        _("Authorized Capital"),
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True
    )

    class Meta:
        app_label = "shareholding"
        db_table = "company_shareholding"
        verbose_name = "Company Shareholding"
        verbose_name_plural = "Company Shareholdings"

    def __str__(self):
        return f"{self.company} | Shares: {self.numbers_of_shares} | Shareholders: {self.numbers_of_shareholders}"

class Shareholder(BaseModel):
    shareholding = models.ForeignKey(
        CompanyShareholding,
        related_name='shareholders',
        on_delete=models.CASCADE
    )
    full_name = models.CharField(max_length=100)
    address = models.TextField()
    number_of_shares = models.PositiveIntegerField()
    percentage_ownership = models.DecimalField(max_digits=5, decimal_places=2)
    is_pep = models.BooleanField(default= False)
    class Meta:
        app_label = "shareholding"
        db_table = "shareholders"
        verbose_name = "Shareholder"
        verbose_name_plural = "Shareholders"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} | Shares: {self.number_of_shares} | Company: {self.shareholding.company}"
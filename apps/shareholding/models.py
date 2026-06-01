from django.db import models
from apps.common.common_models import BaseModelWithClient, BaseModel

# Create your models here.
class CompanyShareholding(BaseModelWithClient):
    numbers_of_shares = models.PositiveIntegerField()
    numbers_of_shareholders = models.PositiveIntegerField()

    class Meta:
        app_label = "shareholding"
        db_table = "company_shareholding"
        verbose_name = "Company Shareholding"
        verbose_name_plural = "Company Shareholdings"
        ordering = ["-numbers_of_shares"]

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

    class Meta:
        app_label = "shareholding"
        db_table = "shareholders"
        verbose_name = "Shareholder"
        verbose_name_plural = "Shareholders"
        ordering = ["-number_of_shares"]

    def __str__(self):
        return f"{self.full_name} | Shares: {self.number_of_shares} | Company: {self.shareholding.company}"
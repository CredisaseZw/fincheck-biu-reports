from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.utils.base_models import BaseFinancialRecord, BaseModelWithSubject

# Create your models here.
class Claims(BaseFinancialRecord):
    class SettlementOptions(models.TextChoices):
        OPEN = "open", "Open"
        SETTLED = "settled", "Settled"

    claim_date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=SettlementOptions.choices,
        default=SettlementOptions.OPEN
    )

    def __str__(self):
        return f"Claim on {self.claim_date} ({self.get_status_display()})"

    class Meta:
        db_table = "claims"
        verbose_name = "Claim"
        verbose_name_plural = "Claims"

class Absconders(BaseFinancialRecord):
    class SettlementOptions(models.TextChoices):
        OPEN = "open", "Open"
        SETTLED = "settled", "Settled"

    start_date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=SettlementOptions.choices,
        default=SettlementOptions.OPEN
    )

    def __str__(self):
        return f"Absconder Record from {self.start_date} ({self.get_status_display()})"

    class Meta:
        db_table= "absconder"
        verbose_name = "Absconder Record"
        verbose_name_plural = "Absconder Records"

class CourtJudgement(BaseModelWithSubject):
    court_name = models.CharField(max_length=255)
    case_number = models.CharField(max_length=100)
    judgement_date = models.DateField()
    amount = models.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    def __str__(self):
        return f"Court Judgement from {self.court_name} on {self.judgement_date}"
    class Meta:
        db_table = "court_judgement"
        verbose_name = "Court Judgement"
        verbose_name_plural = "Court Judgement's"
        
class InsolvencyRecord(BaseModelWithSubject):
    class InsolvencyType(models.TextChoices):
        INSOLVENCY = "insolvency", "Insolvency"
        BANKRUPTCY = "bankruptcy", "Bankruptcy"
        JUDICIAL_MANAGEMENT = (
            "judicial_management",
            "Judicial Management"
        )

    insolvency_type = models.CharField(
        max_length=30,
        choices=InsolvencyType.choices
    )

    start_date = models.DateField()
    end_date = models.DateField(
        blank=True,
        null=True
    )
    court_reference = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.get_insolvency_type_display()} record starting from {self.start_date}"
    class Meta:
        db_table = "insolvency_record"
        verbose_name = "Insolvency Record"
        verbose_name_plural = "Insolvency Records"

class PublicInformation(BaseModelWithSubject):
    record_date = models.DateField(_("Record Date")) 
    summary = models.TextField(blank=True, null=True)
    link = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Public Information on {self.record_date}"

    class Meta:
        db_table = "public_information"
        verbose_name = "Public Information"
        verbose_name_plural = "Public Information"


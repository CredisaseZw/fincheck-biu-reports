from django.db import models
from apps.utils.base_models import BaseModelWithClient, BaseModelWithReport, BaseModelWithReportOTO
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils.translation import gettext_lazy as _
from django.db.models import UniqueConstraint
from django.db import transaction
from django.utils import timezone

# Create your models here.
class Report(BaseModelWithClient):
    subject_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="report_subjects"
    )
    subject_object_id = models.PositiveIntegerField()
    subject = GenericForeignKey("subject_content_type", "subject_object_id")
    enquiry_reference = models.CharField(max_length=20, unique=True, editable=False)
    is_deleted = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if not self.enquiry_reference:
            self.enquiry_reference = self._generate_reference()
        super().save(*args, **kwargs)

    def _generate_reference(self):
        now = timezone.now()
        prefix = now.strftime("%y%m")

        with transaction.atomic():
            last = (
                Report.objects.filter(enquiry_reference__startswith=prefix)
                .select_for_update()
                .order_by("-enquiry_reference")
                .first()
            )
            if last:
                last_seq = int(last.enquiry_reference[4:])
                seq = last_seq + 1
            else:
                seq = 1

        return f"{prefix}{seq:04d}"

    class Meta:
        app_label = "reports"
        db_table = "reports"
        verbose_name = _("Enquiry Report")
        verbose_name_plural = _("Enquiry Reports")
        ordering = ["-created_at"]
        constraints = [
            UniqueConstraint(
                fields= ["enquiry_reference"],
                name='unique_enquiry_reference'
            )   
        ]
    
    def __str__(self):
        return f"Report f{self.enquiry_reference}"
    
class TradeReferences(BaseModelWithReport):
    class PaymentTrend(models.TextChoices):
        GOOD = "good", "Good"
        FAIR = "fair", "Fair"
        POOR = "poor", "Poor"
        
    report = models.OneToOneField(
        Report,
        on_delete=models.CASCADE,
        related_name="references"
    )
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
        app_label = "reports"
        db_table = "trade_references"
        verbose_name = _("Trade Reference")
        verbose_name_plural = _("Trade Reference")
        ordering = ["-created_at"]
    
    def __str__(self):
        name = self.name or "N/A"
        contact = self.contact_info or "N/A"
        return f"{name} | {contact}"


class ReportSummary(BaseModelWithReportOTO):
    overall_risk_rating = models.CharField(max_length=50, blank=True, null=True)
    summary = models.TextField(blank=True, null=True)

    class Meta:
        app_label = "reports"
        db_table = "report_summary"
        verbose_name = _("Report Summary")
        verbose_name_plural = _("Report Summaries")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Summary for Report {self.report.enquiry_reference}"

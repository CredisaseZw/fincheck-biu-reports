import secrets

from django.db import models
from apps.utils.base_models import BaseModelWithSubject
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils.translation import gettext_lazy as _
from django.db.models import UniqueConstraint
from django.db import transaction
from django.utils import timezone


def report_pdf_path(instance, filename):
    now = timezone.now()
    token = secrets.token_hex(5)
    ref = instance.enquiry_reference or "unref"
    return f"reports/{now.strftime('%Y')}/{now.strftime('%b')}/{ref}_{token}.pdf"

# Create your models here.
class Report(BaseModelWithSubject):
    class StatusChoices(models.TextChoices):
        DRAFT = "draft", "Draft"
        FINALIZED = "finalized", "Finalized"
    
    client_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="report_clients"
    )
    client_object_id = models.PositiveIntegerField()
    client = GenericForeignKey("client_content_type", "client_object_id")
    status = models.CharField(
        max_length=20, 
        choices=StatusChoices.choices, 
        default=StatusChoices.DRAFT
    )

    overall_risk_rating = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )
    summary = models.TextField(
        blank=True, 
        null=True
    )

    enquiry_reference = models.CharField(max_length=20, unique=True, editable=False)
    is_deleted = models.BooleanField(default=False)
    
    snapshot = models.JSONField(
        _("Holds how the data was for the subject at the date of finalization"),
        default=dict
    )

    finalized_at = models.DateTimeField(
        null=True,
        blank=True
    )

    report_pdf = models.FileField(
        _("Report PDF"),
        upload_to=report_pdf_path,
        null=True,
        blank=True,
    )

    def save(self, *args, **kwargs):
        if not self.enquiry_reference:
            with transaction.atomic():
                now = timezone.now()
                prefix = now.strftime("%y%m")

                last = (
                    Report.objects.filter(enquiry_reference__startswith=prefix)
                    .select_for_update()
                    .order_by("-enquiry_reference")
                    .first()
                )
                seq = int(last.enquiry_reference[4:]) + 1 if last else 1
                self.enquiry_reference = f"{prefix}{seq:04d}"
                super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

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
        return f"Report {self.enquiry_reference}"
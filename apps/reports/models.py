from django.db import models
from apps.common.common_models import BaseModelWithClient
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils.translation import gettext_lazy as _
from django.db.models import UniqueConstraint
from django.db import transaction
from django.utils import timezone

# Create your models here.
class Report(BaseModelWithClient):
    client_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="report_clients"
    )
    client_object_id = models.PositiveIntegerField()
    client = GenericForeignKey("client_content_type", "client_object_id")

    subject_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="report_subjects"
    )
    subject_object_id = models.PositiveIntegerField()
    subject = GenericForeignKey("subject_content_type", "subject_object_id")
    enquiry_reference = models.CharField(max_length=20, unique=True, editable=False)

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
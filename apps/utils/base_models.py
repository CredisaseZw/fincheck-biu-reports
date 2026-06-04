from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils.translation import gettext_lazy as _

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        abstract = True

class BaseModelWithClient(BaseModel):
    client_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="%(class)s_client"
    )
    client_object_id = models.PositiveIntegerField()
    client = GenericForeignKey("client_content_type", "client_object_id")

    class Meta:
        abstract = True

class BaseModelWithReport(BaseModel):
    report = models.ForeignKey(
        "reports.Report",
        on_delete=models.CASCADE,
        related_name="%(class)s_report"
    )

    class Meta:
        abstract = True
class BaseModelWithReportOTO(BaseModel):
    report = models.OneToOneField(
        "reports.Report",
        on_delete=models.CASCADE,
        related_name="%(class)s_report"
    )

    class Meta:
        abstract = True
class BaseModelWithDebtor(BaseModelWithReport):
    debtor_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="%(class)s_debtor"
    )
    debtor_object_id = models.PositiveIntegerField()
    debtor = GenericForeignKey("debtor_content_type", "debtor_object_id")

    class Meta:
        abstract = True


class BaseFinancialRecord(BaseModelWithDebtor):
    creditor_name = models.CharField(max_length=255)
    currency = models.CharField(max_length=10)
    amount = models.DecimalField(max_digits=18, decimal_places=2)

    class Meta:
        abstract = True

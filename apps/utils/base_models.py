from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils.translation import gettext_lazy as _

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    updated_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_updated_by"
    )

    class Meta:
        abstract = True

class BaseModelWithSubject(BaseModel):
    subject_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="%(class)s_subject"
    )
    subject_object_id = models.PositiveIntegerField()
    subject = GenericForeignKey("subject_content_type", "subject_object_id")

    class Meta:
        abstract = True

class BaseModelWithDebtor(BaseModelWithSubject):
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
    class Currency(models.TextChoices):
        USD = "USD", "US Dollar"
        ZIG = "ZiG", "Zimbabwe Gold"
        AUD = "AUD", "Australian Dollar"
        CAD = "CAD", "Canadian Dollar"
        CHF = "CHF", "Swiss Franc"
        ZAR = "ZAR", "South African Rand"
    creditor_name = models.CharField(max_length=255)
    currency = models.CharField(
        max_length=5,
        choices=Currency.choices,
        default=Currency.USD
    )
    amount = models.DecimalField(max_digits=18, decimal_places=2)

    class Meta:
        abstract = True

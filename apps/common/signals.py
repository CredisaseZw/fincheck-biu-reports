from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import Financials

@receiver(post_delete, sender=Financials)
def delete_financial_file(sender, instance, **kwargs):
    if instance.financials_file:
        instance.financials_file.delete(save=False)
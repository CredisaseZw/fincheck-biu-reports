import re
from decimal import Decimal, InvalidOperation
from rest_framework import serializers
from apps.common.models import ArchivedBankerCodes, BankerAccounts

class CreateEntityGenericHandlers:    
    def _create_generic_relations(self, instance, data_list, model, content_type, updated_by = None):
        for item in data_list:
            item.pop("id", None)
            model.objects.create(
                subject_content_type=content_type,
                subject_object_id=instance.id,
                updated_by = updated_by,
                **item
            )

    def _create_oto_generic(self, instance, data, model, content_type, updated_by = None):
        if not data:
            return
        data = data.copy()
        data.pop("id", None)
        model.objects.create(
            subject_content_type=content_type,
            subject_object_id=instance.id,
            updated_by = updated_by,
            **data
        )

class UpdateEntityGenericHandlers:
    def _update_generic_relations(self, instance, data_list, model, content_type, updated_by = None):
        for item in data_list:
            item_id = item.pop("id", None)
            model.objects.update_or_create(
                pk=item_id,
                defaults={
                    **item,
                    'updated_by' : updated_by,
                    "subject_content_type": content_type,
                    "subject_object_id": instance.id,
                },
            )

    def _update_oto_generic(self, instance, data, model, content_type, updated_by = None):
        if not data:
            return
        data = data.copy()
        data.pop("id", None)
        data['updated_by'] = updated_by
        model.objects.update_or_create(
            subject_content_type=content_type,
            subject_object_id=instance.id,
            defaults=data
        )

    def _split_amount(self, raw, fallback_currency=None):
        currency = fallback_currency or "USD"
        if not raw:
            return None, currency
        text = str(raw)
        for code in BankerAccounts.Currency.values:
            if code.lower() in text.lower():
                currency = code
                break
        digits = re.sub(r"[^\d.]", "", text)
        try:
            return (Decimal(digits) if digits else None), currency
        except InvalidOperation:
            return None, currency


    def _update_banker_account_rows(self, instance, data, content_type, updated_by=None):
        for item in data:
            item = dict(item)
            item_id = item.pop("id", None)

            values = {
                **item,
                "updated_by": updated_by,
                "subject_content_type": content_type,
                "subject_object_id": instance.id,
            }

            if not item_id:
                BankerAccounts.objects.create(**values)
                continue

            old = (BankerAccounts.objects.select_for_update()
                .filter(pk=item_id,
                        subject_content_type=content_type,
                        subject_object_id=instance.id)
                .first())
            if old is None:
                raise serializers.ValidationError(
                    {"banker_accounts": f"Account {item_id} does not belong to this company."}
                )

            new_date = item.get("date_of_acquirement")
            is_new_report = (
                new_date
                and old.date_of_acquirement
                and new_date != old.date_of_acquirement
            )
            has_data = (
                old.bank_code_narration not in (None, "", "none")
                or old.amount
                or old.period
            )

            if is_new_report and has_data:
                amount, currency = self._split_amount(old.amount, old.currency)
                ArchivedBankerCodes.objects.get_or_create(
                    account=old,
                    report_date=old.date_of_acquirement,
                    narration=old.get_bank_code_narration_display() or "",
                    amount=amount,
                    currency=currency,
                    period=old.period,
                )

            for field, value in values.items():
                setattr(old, field, value)
            old.save()    

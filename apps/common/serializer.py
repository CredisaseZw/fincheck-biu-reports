from rest_framework import serializers
from decimal import Decimal, InvalidOperation
from .models import (
    RegistrationAccounts,
    BankerAccounts, 
    ProfessionalPartners, 
    Financials,
    FinancialFiles,
    TradeReferences,
    ArchivedBankerCodes
)
from apps.utils.base_serialisers import UpdatedBySerializerMixin, NullableDateField


def _format_amount(amount):
    if amount is None or str(amount).strip() == "":
        return None
    try:
        val = Decimal(str(amount))
    except (InvalidOperation, ValueError):
        return str(amount)
    return f"{val:,.2f}".replace(",", " ")


def parse_archived_account_codes(banker_account_instance):
    codes = ArchivedBankerCodes.objects.filter(
        account=banker_account_instance.pk,
    ).order_by("-report_date")[:3]

    results = []
    for item in codes:
        narration = item.narration
        has_code = narration and str(narration).strip().lower() != "none"
        amount = _format_amount(item.amount)

        parts = []
        if has_code:
            parts.append(f"BANK CODE {narration}")
        if amount:
            parts.append(f"FOR {amount} {item.currency or ''}")
        if item.period:
            parts.append(f"OVER {item.period}")

        text = " ".join(parts).strip()
        results.append({
            "key": item.id,
            "date": str(item.report_date) if item.report_date else "",
            "text": text,
        })
    return results


def parse_archived_account_codes_from_dict(account_codes_list):
    if not account_codes_list:
        return []

    sorted_codes = sorted(
        account_codes_list,
        key=lambda x: x.get("report_date") or "",
        reverse=True,
    )

    results = []
    for item in sorted_codes:
        narration = item.get("narration")
        has_code = narration and str(narration).strip().lower() != "none"
        amount = _format_amount(item.get("amount"))

        parts = []
        if has_code:
            parts.append(f"BANK CODE {narration}")
        if amount:
            parts.append(f"FOR {amount} {item.get('currency', '')}")
        period = item.get("period")
        if period:
            parts.append(f"OVER {period}")

        text = " ".join(parts).strip()
        results.append({
            "key": item.get("id"),
            "date": str(item.get("report_date", "")),
            "text": text,
        })
    return results


# READ SERIALIZERS
class RegistrationAccountsSerializer(UpdatedBySerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = RegistrationAccounts
        exclude = ["subject_content_type", "subject_object_id"]

class ArchivedBankCodesSerializer(UpdatedBySerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = ArchivedBankerCodes
        exclude = ["account", "created_at"]
class BankerAccountsSerializer(UpdatedBySerializerMixin, serializers.ModelSerializer):
    prev_reports = serializers.SerializerMethodField()
    bank_code_narration_display = serializers.CharField(source="get_bank_code_narration_display", read_only=True)
    
    class Meta:
        model = BankerAccounts
        exclude = ["subject_content_type", "subject_object_id"]

    def get_prev_reports(self, instance: BankerAccounts):
        return parse_archived_account_codes(instance)
    
class ProfessionalPartnersSerializer(UpdatedBySerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = ProfessionalPartners
        exclude = ["subject_content_type", "subject_object_id"]
class FinancialFilesSerializer(UpdatedBySerializerMixin, serializers.ModelSerializer):
    class Meta: 
        model = FinancialFiles
        exclude  = ['financial']
class FinancialsSerializer(UpdatedBySerializerMixin, serializers.ModelSerializer):
    files = FinancialFilesSerializer(many=True, source="financial_files", read_only=True)
    class Meta:
        model = Financials
        exclude = ["subject_content_type", "subject_object_id"]
class TradeReferencesSerializer(UpdatedBySerializerMixin, serializers.ModelSerializer):
    payment_trend_display = serializers.CharField(source="get_payment_trend_display", read_only=True)
    class Meta:
        model = TradeReferences
        exclude = ["subject_content_type", "subject_object_id"]

# WRITE SERIALIZERS
class RegistrationAccountsWriteSerializer(serializers.ModelSerializer):
    tax_clearance_expiration_date = serializers.DateField(required=False, allow_null=True)
    class Meta:
        model = RegistrationAccounts
        fields = [
            "tin_number",
            "vat_number",
            "nssa_number",
            "praz_number",
            'tax_clearance_expiration_date',
            'is_tax_clearance_expiration_date',
            "is_praz_verified",
            "is_nssa_verified",
            "is_vat_verified",
            "is_tin_verified",
        ]

    def to_internal_value(self, data):
        data = data.copy()
        if data.get('tax_clearance_expiration_date') == '':
            data['tax_clearance_expiration_date'] = None
        return super().to_internal_value(data)


class BankerAccountsWriteSerializer(serializers.ModelSerializer):
    account_type = serializers.ChoiceField(choices=BankerAccounts.AccountType.choices)
    id = serializers.IntegerField(required=False)
    date_of_acquirement = NullableDateField(required=False, allow_null=True)

    class Meta:
        model = BankerAccounts
        fields = [
            "id",
            "bank",
            "branch",
            "account_name",
            "account_type",
            "account_number",
            "date_of_acquirement",
            "bank_code_narration",
            "currency",
            "amount", 
            "period"
        ]


class ProfessionalPartnersWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalPartners
        fields = [
            "auditors",
            "lawyers",
        ]

class FinancialsWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Financials
        fields = [
            "subject_content_type",
            "subject_object_id",
            "total_assets",
            "net_profit",
            "net_worth",
            "total_revenue",
            "asset_ratio",
            "financial_year",
        ]

class TradeReferencesWriteSerializer(serializers.ModelSerializer):
    payment_trend = serializers.ChoiceField(
        choices=TradeReferences.PaymentTrend.choices,
        required=False
    )
    id = serializers.IntegerField(required=False)

    class Meta:
        model = TradeReferences
        fields = [
            "id",
            "subject_content_type",
            "subject_object_id",
            "name",
            "contact_info",
            "reference_source",
            "position",
            "credit_limit",
            "credit_terms",
            "payment_trend",
        ]

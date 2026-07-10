from rest_framework import serializers
from .models import (
    RegistrationAccounts,
    BankerAccounts, 
    ProfessionalPartners, 
    Financials,
    TradeReferences
)
from apps.utils.base_serialisers import UpdatedBySerializerMixin
# READ SERIALIZERS
class RegistrationAccountsSerializer(UpdatedBySerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = RegistrationAccounts
        exclude = ["subject_content_type", "subject_object_id"]

class BankerAccountsSerializer(UpdatedBySerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = BankerAccounts
        exclude = ["subject_content_type", "subject_object_id"]

class ProfessionalPartnersSerializer(UpdatedBySerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = ProfessionalPartners
        exclude = ["subject_content_type", "subject_object_id"]

class FinancialsSerializer(UpdatedBySerializerMixin, serializers.ModelSerializer):
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
    class Meta:
        model = RegistrationAccounts
        fields = [
            "tin_number",
            "vat_number",
            "nssa_number",
            "praz_number",
            "is_praz_verified",
            "is_nssa_verified",
            "is_vat_verified",
            "is_tin_verified",
        ]


class BankerAccountsWriteSerializer(serializers.ModelSerializer):
    account_type = serializers.ChoiceField(choices=BankerAccounts.AccountType.choices)
    id = serializers.IntegerField(required=False)
    class Meta:
        model = BankerAccounts
        fields = [
            "id",
            "bank",
            "branch",
            "account_name",
            "account_currency",
            "account_type",
            "account_number",
            "date_of_acquirement",
            "bank_code",
            "narration",
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
            "financials_file",
            "financial_year",
        ]
        extra_kwargs = {
            "financials_file": {"required": False},
        }

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


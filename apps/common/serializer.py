from rest_framework import serializers
from .models import RegistrationAccounts, BankerAccounts, ProfessionalPartners, Financials

# READ SERIALIZERS
class RegistrationAccountsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationAccounts
        exclude = ["client_content_type", "client_object_id", "created_at", "updated_at"]


class BankerAccountsSerializer(serializers.ModelSerializer):
    account_type_display = serializers.CharField(source="get_account_type_display", read_only=True)

    class Meta:
        model = BankerAccounts
        exclude = ["client_content_type", "client_object_id", "created_at", "updated_at"]


class ProfessionalPartnersSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalPartners
        exclude = ["client_content_type", "client_object_id", "created_at", "updated_at"]


class FinancialsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Financials
        exclude = ["client_content_type", "client_object_id", "created_at", "updated_at"]


# WRITE SERIALIZERS
class RegistrationAccountsWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationAccounts
        fields = [
            "client_content_type",
            "client_object_id",
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

    class Meta:
        model = BankerAccounts
        fields = [
            "client_content_type",
            "client_object_id",
            "bank",
            "branch",
            "account_name",
            "account_type",
            "account_number",
        ]


class ProfessionalPartnersWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalPartners
        fields = [
            "client_content_type",
            "client_object_id",
            "auditors",
            "lawyers",
        ]


class FinancialsWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Financials
        fields = [
            "client_content_type",
            "client_object_id",
            "total_assets",
            "net_profit",
            "net_worth",
            "total_revenue",
            "paid_up_capital",
            "authorized_capital",
            "profit_and_loss",
            "statement_of_financial_position",
            "financial_year",
        ]
from .models import Shareholder, CompanyShareholding
from rest_framework import serializers
from apps.utils.mini_serializers import MiniCompanySerializer

class ShareholderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shareholder,
        exclude = ['shareholding']
class ShareholdingsSerializers(serializers.ModelSerializer):
    shareholders = ShareholderSerializer(many = True, read_only =True)
    class Meta:
        model = CompanyShareholding,
        fields = [
            'numbers_of_shares',
            'numbers_of_shareholders'
            'shareholders',
            'created_at',
            'updated_at'
        ]
class CompanyShareholdingsSerializer(serializers.ModelSerializer):
    company = MiniCompanySerializer(read_only = True, source = "shareholdings")
    shareholders = ShareholderSerializer(many = True, read_only =True)
    class Meta:
        model = CompanyShareholding,
        fields = [
            'company',
            'numbers_of_shares',
            'numbers_of_shareholders'
            'shareholders',
            'created_at',
            'updated_at'
        ]
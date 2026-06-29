from .models import Shareholder, CompanyShareholding
from rest_framework import serializers
from apps.utils.mini_serializers import MiniCompanySerializer

class ShareholderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shareholder
        exclude = ['shareholding']

class ShareholdingsSerializers(serializers.ModelSerializer):
    shareholders = serializers.SerializerMethodField()

    class Meta:
        model = CompanyShareholding
        fields = [
            'id',
            'numbers_of_shares',
            'numbers_of_shareholders',
            'shareholders',
            'created_at',
            'updated_at'
        ]

    def get_shareholders(self, obj):
        qs = obj.shareholders.order_by("created_at")
        return ShareholderSerializer(qs, many=True).data
class CompanyShareholdingsSerializer(serializers.ModelSerializer):
    company = MiniCompanySerializer(read_only = True, source = "shareholdings")
    shareholders = ShareholderSerializer(many = True, read_only =True)
    class Meta:
        model = CompanyShareholding
        fields = [
            'company',
            'numbers_of_shares',
            'numbers_of_shareholders',
            'shareholders',
            'created_at',
            'updated_at'
        ]

class CompanyShareholdingWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyShareholding
        fields = "__all__"

class ShareholderWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model =Shareholder
        exclude = ['shareholding']
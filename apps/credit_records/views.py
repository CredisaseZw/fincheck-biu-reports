from rest_framework.response import Response
from rest_framework import status as STATUS
from apps.utils.helpers import validate_serializer
from apps.utils.permissions import IsStaffUser
from django.contrib.contenttypes.models import ContentType
from apps.reports.models import Report
from django.db.models import Model
from rest_framework.serializers import ModelSerializer
from apps.companies.models import Company
from apps.individuals.models import Individuals
from rest_framework.decorators import action
from .models import (
    Absconders, 
    Claims, 
    CourtJudgement,
    InsolvencyRecord,
    PublicInformation
)
from .serializers import (
    ClaimsWriteSerializer,
    CreditRecordsSerializer,
    AbscondersWriteSerializer,
    CourtJudgementWriteSerializer,
    InsolvencyRecordWriteSerializer,
    PublicInformationWriteSerializer
)
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import RetrieveModelMixin
# Create your views here.

class CreditRecordsViewSet(RetrieveModelMixin, GenericViewSet):
    pagination_class = None
    permission_classes = [IsStaffUser]
    serializer_class = CreditRecordsSerializer
    queryset = Report.objects.prefetch_related(
        "claims_report",
        "absconders_report",
        "courtjudgement_report",
        "insolvencyrecord_report",
        "publicinformation_report"
    ).all()

    def _update_record( 
            self,
            request, 
            serializer_class: ModelSerializer, 
            data : any,
            model: Model
        ):
        record_id = data.pop("id")
        try:
            instance = model.objects.get(pk=record_id)
        except model.DoesNotExist:
            return Response(
                {"error": f"{model.__name__} does not exist"},
                status=STATUS.HTTP_400_BAD_REQUEST
            )

        serializer = serializer_class(
            instance,
            data=data,
            partial=True,
            context={"request": request}
        )
        error = validate_serializer(serializer=serializer)
        if error:
            return error

        serializer.save()
        return None

    def _create_record(
            self, 
            report_id: int,
            serializer_class : ModelSerializer, 
            data: any
        
        ):
        data["report"] = report_id
        serializer = serializer_class(data=data)
        error = validate_serializer(serializer=serializer)
        if error:
            return error

        serializer.save()
        return None
    
    
    def _get_debtor(self, debtor_object_id):
        debtor = Company.objects.filter(pk=debtor_object_id).first()
        if not debtor:
            debtor = Individuals.objects.filter(pk=debtor_object_id).first()
        if not debtor:
            return None
        return ContentType.objects.get_for_model(debtor).id
    

    @action(url_path="claims", methods=["PATCH"], detail=True)
    def update_or_create_claims(self, request, *args, **kwargs):
        report = self.get_object()
        claims = request.data.get("claims", None)

        if not claims:
            return Response({
                "error" : "Claims required."
            }, status=STATUS.HTTP_400_BAD_REQUEST)

        for claim in claims:
            if claim.get("id", None):
                self._update_record(
                    request=request,
                    serializer_class = ClaimsWriteSerializer,
                    data = claim,
                    model= Claims
                )
            self._create_record()
        
        report.refresh_from_db()
        return Response(
            CreditRecordsSerializer(instance = report).data,
            status=STATUS.HTTP_200_OK
        )

    @action(url_path="claims", methods=["PATCH"], detail=True)
    def update_or_create_claims(self, request, *args, **kwargs):
        report = self.get_object()
        claims = request.data.get("claims", None)

        if not claims:
            return Response(
                {"error": "Claims required."},
                status=STATUS.HTTP_400_BAD_REQUEST
            )

        for claim in claims:
            if debtor_id := claim.get("debtor_object_id"):
                content_type_id = self._get_debtor(debtor_id)
                if not content_type_id:
                    return Response(
                        {"error": f"Debtor with id {debtor_id} does not exist"},
                        status=STATUS.HTTP_400_BAD_REQUEST
                    )
                claim["debtor_content_type"] = content_type_id

            if claim.get("id"):
                error = self._update_record(
                    request=request,
                    serializer_class=ClaimsWriteSerializer,
                    data=claim,
                    model=Claims
                )
            else:
                error = self._create_record(
                    request=request,
                    report_id=report.id,
                    serializer_class=ClaimsWriteSerializer,
                    data=claim
                )

            if error:
                return error

        report.refresh_from_db()
        return Response(
            CreditRecordsSerializer(instance=report).data,
            status=STATUS.HTTP_200_OK
        )
    
    @action(url_path="absconders", methods=["PATCH"], detail=True)
    def update_or_create_absconders(self, request, *args, **kwargs):
        report = self.get_object()
        absconders = request.data.get("absconders", None)

        if not absconders:
            return Response(
                {"error": "Absconders required."},
                status=STATUS.HTTP_400_BAD_REQUEST
            )

        for absconder in absconders:
            if debtor_id := absconder.get("debtor_object_id"):
                content_type_id = self._get_debtor(debtor_id)
                if not content_type_id:
                    return Response(
                        {"error": f"Debtor with id {debtor_id} does not exist"},
                        status=STATUS.HTTP_400_BAD_REQUEST
                    )
                absconder["debtor_content_type"] = content_type_id

            if absconder.get("id"):
                error = self._update_record(
                    request=request,
                    serializer_class=AbscondersWriteSerializer,
                    data=absconder,
                    model=Absconders
                )
            else:
                error = self._create_record(
                    request=request,
                    report_id=report.id,
                    serializer_class=AbscondersWriteSerializer,
                    data=absconder
                )

            if error:
                return error

        report.refresh_from_db()
        return Response(
            CreditRecordsSerializer(instance=report).data,
            status=STATUS.HTTP_200_OK
        ) 
   
    @action(url_path="insolvency-records", methods=["PATCH"], detail=True)
    def update_or_create_insolvency_records(self, request, *args, **kwargs):
        report = self.get_object()
        insolvency_records = request.data.get("insolvency_records", None)

        if not insolvency_records:
            return Response(
                {"error": "Insolvency records required."},
                status=STATUS.HTTP_400_BAD_REQUEST
            )

        for record in insolvency_records:
            if debtor_id := record.get("debtor_object_id"):
                content_type_id = self._get_debtor(debtor_id)
                if not content_type_id:
                    return Response(
                        {"error": f"Debtor with id {debtor_id} does not exist"},
                        status=STATUS.HTTP_400_BAD_REQUEST
                    )
                record["debtor_content_type"] = content_type_id

            if record.get("id"):
                error = self._update_record(
                    request=request,
                    serializer_class=InsolvencyRecordWriteSerializer,
                    data=record,
                    model=InsolvencyRecord
                )
            else:
                error = self._create_record(
                    request=request,
                    report_id=report.id,
                    serializer_class=InsolvencyRecordWriteSerializer,
                    data=record
                )

            if error:
                return error

        report.refresh_from_db()
        return Response(
            CreditRecordsSerializer(instance=report).data,
            status=STATUS.HTTP_200_OK
        )

    @action(url_path="public-information", methods=["PATCH"], detail=True)
    def update_or_create_public_information(self, request, *args, **kwargs):
        report = self.get_object()
        public_information = request.data.get("public_information", None)

        if not public_information:
            return Response(
                {"error": "Public information required."},
                status=STATUS.HTTP_400_BAD_REQUEST
            )

        for info in public_information:
            if info.get("id"):
                error = self._update_record(
                    request=request,
                    serializer_class=PublicInformationWriteSerializer,
                    data=info,
                    model=PublicInformation
                )
            else:
                error = self._create_record(
                    request=request,
                    report_id=report.id,
                    serializer_class=PublicInformationWriteSerializer,
                    data=info
                )

            if error:
                return error

        report.refresh_from_db()
        return Response(
            CreditRecordsSerializer(instance=report).data,
            status=STATUS.HTTP_200_OK
        )

    @action(url_path="court-judgements", methods=["PATCH"], detail=True)
    def update_or_create_court_judgements(self, request, *args, **kwargs):
        report = self.get_object()
        court_judgements = request.data.get("court_judgements", None)

        if not court_judgements:
            return Response(
                {"error": "Court judgements required."},
                status=STATUS.HTTP_400_BAD_REQUEST
            )

        for judgement in court_judgements:
            if judgement.get("id"):
                error = self._update_record(
                    request=request,
                    serializer_class=CourtJudgementWriteSerializer,
                    data=judgement,
                    model=CourtJudgement
                )
            else:
                error = self._create_record(
                    request=request,
                    report_id=report.id,
                    serializer_class=CourtJudgementWriteSerializer,
                    data=judgement
                )

            if error:
                return error

        report.refresh_from_db()
        return Response(
            CreditRecordsSerializer(instance=report).data,
            status=STATUS.HTTP_200_OK
        )
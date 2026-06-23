from rest_framework.response import Response
from rest_framework import status as STATUS
from apps.utils.helpers import validate_serializer, get_content_type_id
from apps.utils.permissions import IsStaffUser
from apps.reports.models import Report
from django.db.models import Model
from rest_framework.serializers import ModelSerializer
from rest_framework.decorators import action
from .models import (
    Absconders, 
    Claims, 
    CourtJudgement,
    InsolvencyRecord,
    PublicInformation
)
from .serializers import (
    ClaimsSerializer,
    AbscondersSerializer,
    CourtJudgementSerializer,
    InsolvencyRecordSerializer,
    PublicInformationSerializer,

    ClaimsWriteSerializer,
    AbscondersWriteSerializer,
    CourtJudgementWriteSerializer,
    InsolvencyRecordWriteSerializer,
    PublicInformationWriteSerializer
)
from rest_framework.viewsets import GenericViewSet
# Create your views here.

class CreditRecordsViewSet(GenericViewSet):
    permission_classes = [IsStaffUser]
    RECORD_MAP = {
        "claims": Claims,
        "absconders": Absconders,
        "court_judgements": CourtJudgement,
        "insolvency_records": InsolvencyRecord,
        "public_information" : PublicInformation
    }

    def _update_record( 
            self,
            request, 
            serializer_class: ModelSerializer, 
            data : any,
            instance: Model
        ):
        
        if data.get("id"): 
            data.pop("id")

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
            data : dict,
            serializer_class: ModelSerializer
        ):
        serializer_ = serializer_class(data = data)
        error = validate_serializer(serializer = serializer_)
        if error:
            return error

        serializer_.save()
        return None 
        
    @action(url_path="claims", methods=["PATCH"], detail=False)
    def update_or_create_claims(self, request, *args, **kwargs):
        subject_type = request.data.get("subject_type", None)
        subject_object_id = request.data.get("subject_object_id", None)
        claims = request.data.get("claims", None)
     
        for r in ["subject_type", "subject_object_id", "claims"]:
            if not request.data.get(r, None):
                return Response(
                    {"error": f"{r.replace('_', " ")} is required."},
                    status=STATUS.HTTP_400_BAD_REQUEST
                )
        
        content_type_id = get_content_type_id(subject_object_id, subject_type)

        for claim in claims:
            if debtor_id := claim.get("debtor_object_id"):
                debtor_content_type_id = get_content_type_id(debtor_id, claim.get("debtor_type"))
                if not debtor_content_type_id:
                    return Response(
                        {"error": f"Debtor with id {debtor_id} does not exist"},
                        status=STATUS.HTTP_400_BAD_REQUEST
                    )
                claim["debtor_content_type"] = debtor_content_type_id

            instance = Claims.objects.filter(pk = claim.get("id", None)).first()
            if instance:
                result = self._update_record(
                    request=request,
                    serializer_class=ClaimsWriteSerializer,
                    data=claim,
                    instance=instance
                )
            else:
                claim["subject_content_type"] = content_type_id
                claim["subject_object_id"] = subject_object_id
                result = self._create_record(
                    data = claim,
                    serializer_class = ClaimsWriteSerializer
                )

            if isinstance(result, Response):
                return result

        subject_claims = Claims.objects.filter(
            subject_content_type_id=content_type_id,
            subject_object_id=subject_object_id,
        )
        return Response(
            {"claims" : ClaimsSerializer(subject_claims, many = True).data},
            status=STATUS.HTTP_200_OK
        )
    
    @action(url_path="absconders", methods=["PATCH"], detail=False)
    def update_or_create_absconders(self, request, *args, **kwargs):
        subject_type = request.data.get("subject_type", None)
        subject_object_id = request.data.get("subject_object_id", None)
        absconders = request.data.get("absconders", None)

        for r in ["subject_type", "subject_object_id", "absconders"]:
            if not request.data.get(r, None):
                return Response(
                    {"error": f"{r.replace('_', " ")} is required."},
                    status=STATUS.HTTP_400_BAD_REQUEST
                )
        subject_content_type_id = get_content_type_id(subject_object_id, subject_type)

        for absconder in absconders:
            if debtor_id := absconder.get("debtor_object_id"):
                content_type_id = get_content_type_id(debtor_id, absconder.get("debtor_type"))
                if not content_type_id:
                    return Response(
                        {"error": f"Debtor with id {debtor_id} does not exist"},
                        status=STATUS.HTTP_400_BAD_REQUEST
                    )
                absconder["debtor_content_type"] = content_type_id

            instance = Absconders.objects.filter(pk = absconder.get("id", None)).first()
            if instance:
                result = self._update_record(
                    request=request,
                    serializer_class=AbscondersWriteSerializer,
                    data=absconder,
                    instance=instance
                )
            else:
                absconder["subject_content_type"] = subject_content_type_id
                absconder["subject_object_id"] = subject_object_id
                result = self._create_record(
                    data = absconder,
                    serializer_class = AbscondersWriteSerializer
                )

            if isinstance(result, Response):
                return result
        
        subject_absconders = Absconders.objects.filter(
            subject_content_type_id=subject_content_type_id,
            subject_object_id=subject_object_id,
        )

        return Response(
            {"absconders" : AbscondersSerializer(subject_absconders, many= True).data},
            status=STATUS.HTTP_200_OK
        ) 
   
    @action(url_path="insolvency-records", methods=["PATCH"], detail=False)
    def update_or_create_insolvency_records(self, request, *args, **kwargs):
        subject_type = request.data.get("subject_type", None)
        subject_object_id = request.data.get("subject_object_id", None)
        insolvency_records = request.data.get("insolvency_records", None)

        for r in ["subject_type", "subject_object_id", "insolvency_records"]:
            if not request.data.get(r, None):
                return Response(
                    {"error": f"{r.replace('_', " ")} is required."},
                    status=STATUS.HTTP_400_BAD_REQUEST
                )      
              
        subject_content_type_id = get_content_type_id(subject_object_id, subject_type)
        
        for record in insolvency_records:
            instance = InsolvencyRecord.objects.filter(pk = record.get("id", None)).first()
            if instance:
                result = self._update_record(
                    request=request,
                    serializer_class=InsolvencyRecordWriteSerializer,
                    data=record,
                    instance=instance
                )
            else:
                record["subject_content_type"] = subject_content_type_id
                record["subject_object_id"] = subject_object_id
                result = self._create_record(
                    data = record,
                    serializer_class = InsolvencyRecordWriteSerializer
                )
            if isinstance(result, Response):
                return result
            
        all_records  = InsolvencyRecord.objects.filter(
            subject_content_type_id=subject_content_type_id,
            subject_object_id=subject_object_id,
        )

        return Response(
            {"insolvency_records" : InsolvencyRecordSerializer(all_records, many= True).data}, 
            status=STATUS.HTTP_200_OK
        )

    @action(url_path="public-information", methods=["PATCH"], detail=False)
    def update_or_create_public_information(self, request, *args, **kwargs):
        subject_type = request.data.get("subject_type", None)
        subject_object_id = request.data.get("subject_object_id", None)
        public_information = request.data.get("public_information", None)

        for r in ["subject_type", "subject_object_id", "public_information"]:
            if not request.data.get(r, None):
                return Response(
                    {"error": f"{r.replace('_', " ")} is required."},
                    status=STATUS.HTTP_400_BAD_REQUEST
                )      
                         
        subject_content_type_id = get_content_type_id(subject_object_id, subject_type)
 
        for info in public_information:
            instance = PublicInformation.objects.filter(pk = info.get("id", None)).first()
            if instance:
                result = self._update_record(
                    request=request,
                    serializer_class=PublicInformationWriteSerializer,
                    data=info,
                    instance=instance
                )
            else:
                info["subject_content_type"] = subject_content_type_id
                info["subject_object_id"] = subject_object_id
                result = self._create_record(
                    data = info,
                    serializer_class = PublicInformationWriteSerializer
                )

            if isinstance(result, Response):
                return result
            
        subject_information  = PublicInformation.objects.filter(
            subject_content_type_id=subject_content_type_id,
            subject_object_id=subject_object_id,
        )

        return Response(
            {"public_information" : PublicInformationSerializer(subject_information, many= True).data}, 
            status=STATUS.HTTP_200_OK
        )

    @action(url_path="court-judgements", methods=["PATCH"], detail=False)
    def update_or_create_court_judgements(self, request, *args, **kwargs):

        subject_type = request.data.get("subject_type", None)
        subject_object_id = request.data.get("subject_object_id", None)
        court_judgements = request.data.get("court_judgements", None)

        for r in ["subject_type", "subject_object_id", "court_judgements"]:
            if not request.data.get(r, None):
                return Response(
                    {"error": f"{r.replace('_', " ")} is required."},
                    status=STATUS.HTTP_400_BAD_REQUEST
                )      
                         
        subject_content_type_id = get_content_type_id(subject_object_id, subject_type)

        for judgement in court_judgements:
            instance = CourtJudgement.objects.filter(pk = judgement.get("id", None)).first()
            if instance:
                result = self._update_record(
                    request=request,
                    serializer_class=CourtJudgementWriteSerializer,
                    data=judgement,
                    instance=instance
                )
            else:
                judgement["subject_content_type"] = subject_content_type_id
                judgement["subject_object_id"] = subject_object_id
                result = self._create_record(
                    data = judgement,
                    serializer_class = CourtJudgementWriteSerializer
                )
            if isinstance(result, Response):
                return result
            
        all_judgements  = CourtJudgement.objects.filter(
            subject_content_type_id=subject_content_type_id,
            subject_object_id=subject_object_id,
        )

        return Response(            
            {"court_judgements" : CourtJudgementSerializer(all_judgements, many= True).data}, 
            status=STATUS.HTTP_200_OK
        )
    
    @action(url_path="(?P<record_type>[^/.]+)/(?P<id>[^/.]+)", methods=["DELETE"], detail=False)
    def update_record(self, request, record_type=None, id=None, *args, **kwargs):
        if not record_type or not id:
            return Response(
                {"error": "record_type and id are required."},
                status=STATUS.HTTP_400_BAD_REQUEST
            )

        model = self.RECORD_MAP.get(record_type)
        if not model:
            return Response(
                {"error": f"Invalid record type '{record_type}'."},
                status=STATUS.HTTP_400_BAD_REQUEST
            )

        instance = model.objects.filter(pk=id).first()
        if not instance:
            return Response(
                {"error": f"{record_type} with id {id} does not exist."},
                status=STATUS.HTTP_404_NOT_FOUND
            )

        instance.delete()
        return Response(status=STATUS.HTTP_204_NO_CONTENT)
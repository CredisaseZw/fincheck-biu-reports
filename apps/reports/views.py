from rest_framework.response import Response
from apps.utils.base_viewset import BaseJSONViewSet
from apps.reports.models import Report
from django.db.models import Model
from apps.companies.models import Company
from apps.individuals.models import Individuals
from .serializers import ReportSerializer, ListReportSerializer, CreateReportSerializer
from rest_framework import status as STATUS
from django.contrib.contenttypes.models import ContentType
class ReportViewSet(BaseJSONViewSet):
    ordering_fields = ["created_at", "enquiry_reference"]
    search_fields = ["enquiry_reference"]
    queryset = Report.objects.prefetch_related(
        "references_report",
        "claims_report",
        "absconders_report",
        "courtjudgement_report",
        "insolvencyrecord_report",
        "publicinformation_report"
    ).select_related(
        "reportsummary_report"
    )
    serializer_class = ReportSerializer

    def _get_content_instance(self, id: int) -> Model:
        instance = Company.objects.filter(pk = id).first()
        if not instance:
            instance  = Individuals.objects.filter(pk = id).first()
        
        return instance

    def _get_content_type_id(self, model: Model) -> id:
        return ContentType.objects.get_for_model(model=model).id

    def get_serializer_class(self):
        if self.action == "list":
            return ListReportSerializer
        return ReportSerializer

    def create(self, request, *args, **kwargs):
        #required subject_object_id, client_object_id
        
        subject = self._get_content_instance(request.data.get("subject_object_id", ""))
        client = self._get_content_instance(request.data.get("client_object_id", ""))

        if not subject:
            return Response({
                "error" : "Subject is required"
            }, status=STATUS.HTTP_400_BAD_REQUEST)

        if not client:
            return Response({
                "error" : "Client is required"
            }, status=STATUS.HTTP_400_BAD_REQUEST)

        if subject == client:
            return Response({
                "error" : "Subject & client cannot be the same"
            }, status=STATUS.HTTP_400_BAD_REQUEST)

        report = Report.objects.create(
            subject_object_id =  subject.id,
            client_object_id = client.id,
            subject_content_type = self._get_content_type_id(subject),
            client_content_type = self._get_content_type_id(client)   
        )

        report.refresh_from_db()
        return Response(
            ReportSerializer(report).data,
            status=STATUS.HTTP_201_CREATED
        )
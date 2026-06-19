from rest_framework.response import Response
from apps.utils.base_viewset import BaseJSONViewSet
from apps.utils.helpers import get_content_type_id
from apps.reports.models import Report
from .serializers import ReportSerializer, ListReportSerializer
from rest_framework import status as STATUS
from .models import Report
from rest_framework.decorators import action
class ReportViewSet(BaseJSONViewSet):
    search_fields = ["enquiry_reference"]
    queryset = Report.objects.prefetch_related(
        "tradereferences_report"
        "courtjudgement_report",
        "insolvencyrecord_report",
        "publicinformation_report"
    ).filter(is_deleted=False)

    serializer_class = ReportSerializer

    def get_serializer_class(self):
        if self.action == "list":
            return ListReportSerializer
        return ReportSerializer

    def create(self, request, *args, **kwargs):
        subject_id = request.data.get("subject_object_id")
        client_id = request.data.get("client_object_id")
        subject_type = request.data.get("subject_type")
        client_type = request.data.get("client_type")

        subject_content_type_id = get_content_type_id(subject_id, subject_type)
        client_content_type_id = get_content_type_id(client_id, client_type)

        if not subject_content_type_id:
            return Response(
                {"error": "Invalid subject_object_id or subject_type."},
                status=STATUS.HTTP_400_BAD_REQUEST
            )

        if not client_content_type_id:
            return Response(
                {"error": "Invalid client_object_id or client_type."},
                status=STATUS.HTTP_400_BAD_REQUEST
            )

        if subject_id == client_id and subject_type == client_type:
            return Response(
                {"error": "Subject & client cannot be the same."},
                status=STATUS.HTTP_400_BAD_REQUEST
            )

        report = Report.objects.create(
            subject_object_id=subject_id,
            subject_content_type_id=subject_content_type_id,
            client_object_id=client_id,
            client_content_type_id=client_content_type_id,
        )

        report.refresh_from_db()
        return Response(
            ReportSerializer(report).data,
            status=STATUS.HTTP_201_CREATED
        )
    
    @action(url_path="finalize-report", detail=True, methods=["POST"])
    def finalize_report(self, request, *args, **kwargs):
        report = self.get_object()

        if report.status == report.StatusChoices.FINALIZED:
            return Response({"error" : "Report already finalized."}, status=STATUS.HTTP_400_BAD_REQUEST)
        

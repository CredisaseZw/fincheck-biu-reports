from rest_framework.response import Response
from apps.utils.base_viewset import BaseJSONViewSet
from apps.utils.helpers import get_content_type_id
from apps.reports.models import Report
from .serializers import ReportSerializer, ListReportSerializer
from rest_framework import status as STATUS
from .filters import ReportSearchFilter
from rest_framework.decorators import action
from django.utils import timezone
from apps.reports.GenerateReport import FincheckReportPDF
class ReportViewSet(BaseJSONViewSet):
    filter_backends = [ReportSearchFilter]
    queryset = Report.objects.all()
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
    
    def destroy(self, request, *args, **kwargs):
        report = self.get_object()
        if report.status == report.StatusChoices.FINALIZED:
            return Response({"error" : "Report already finalized."}, status=STATUS.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs) 

    def partial_update(self, request, *args, **kwargs):
        report = self.get_object()
        if report.status == report.StatusChoices.FINALIZED:
            return Response({"error" : "Report already finalized."}, status=STATUS.HTTP_400_BAD_REQUEST)

        return super().partial_update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        report = self.get_object()
        if report.status == report.StatusChoices.FINALIZED:
            return Response({"error" : "Report already finalized."}, status=STATUS.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)
    
    @action(url_path="finalize-report", detail=True, methods=["POST"])
    def finalize_report(self, request, *args, **kwargs):
        report = self.get_object()
        
        if report.status == report.StatusChoices.FINALIZED:
            return Response({"error" : "Report already finalized."}, status=STATUS.HTTP_400_BAD_REQUEST)

        if report.overall_risk_rating in (None, ""):
            return Response(
                {"error": "Overall risk rating is required."},
                status=STATUS.HTTP_400_BAD_REQUEST,
            )

        report.status = Report.StatusChoices.FINALIZED
        report.finalized_at = timezone.now()
        report.snapshot = ReportSerializer(report).data
        report.save()

        pdf_url = FincheckReportPDF(report).save_to_report(report)
        report.save(update_fields=["report_pdf"])

        return Response({"url": pdf_url}, status=STATUS.HTTP_200_OK)
    




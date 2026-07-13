import redis
import logging
from rest_framework.request import Request
from rest_framework.response import Response
from django.conf import settings
from apps.utils.base_viewset import BaseJSONViewSet
from apps.utils.helpers import get_content_type_id
from apps.reports.models import Report
from .serializers import ReportSerializer, ListReportSerializer
from rest_framework import status as STATUS
from .filters import ReportSearchFilter,ReportsFilter
from rest_framework.decorators import action
from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from apps.reports.GenerateReport import FincheckReportPDF
from apps.users.models import User
from .lock_management import (
    acquire_report_lock,
    refresh_report_lock,
    release_report_lock
)
logger = logging.getLogger(__name__)

r = redis.from_url(settings.REDIS_CACHE_LOCATION)
class ReportViewSet(BaseJSONViewSet):
    filter_backends = [ReportSearchFilter, DjangoFilterBackend]
    queryset = Report.objects.all()
    filterset_class = ReportsFilter
    serializer_class = ReportSerializer
    
    def get_serializer_class(self):
        if self.action == "list":
            return ListReportSerializer
        return ReportSerializer

    def create(self, request: Request, *args, **kwargs):
        user = request.user
        username = request.data.get("username", "")
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
        
        subject_holder = r.get(f"subject_lock:{subject_id}")
        if subject_holder:
            return Response(
                {"error": "This subject has another report currently being edited."},
                status=STATUS.HTTP_423_LOCKED,
            )
        status = Report.StatusChoices.IN_PROGRESS if self.request.user.is_staff else Report.StatusChoices.DRAFT
        report = Report.objects.create(
            subject_object_id=subject_id,
            subject_content_type_id=subject_content_type_id,
            client_object_id=client_id,
            username = username,
            client_content_type_id=client_content_type_id,
            status = status,
            updated_by = user   
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
        user  = request.user
        report = self.get_object()

        if report.status == report.StatusChoices.FINALIZED:
            return Response({"error": "Report already finalized."}, status=STATUS.HTTP_400_BAD_REQUEST)

        if report.overall_risk_rating in (None, ""):
            return Response(
                {"error": "Overall risk rating is required."},
                status=STATUS.HTTP_400_BAD_REQUEST,
            )
    
        with transaction.atomic():
            report.status = Report.StatusChoices.FINALIZED
            report.finalized_at = timezone.now()
            report.snapshot = ReportSerializer(report).data
            report.updated_by = user
            pdf_url = FincheckReportPDF(report).save_to_report(report)
            report.save(update_fields=["status", "finalized_at", "snapshot", "report_pdf", "updated_by"]) 

        release_report_lock(report_id=report.id, user_id= user.id, subject_id=report.subject.id)
        return Response({"url": pdf_url}, status=STATUS.HTTP_200_OK)
        

    @action(url_path="acquire-report-lock", detail=True, methods=['POST'])
    def acquire_lock(self, request, *args, **kwargs):
        report = self.get_object()
        subject_id  = report.subject.id

        if report.status == Report.StatusChoices.FINALIZED:
            return Response({"detail" : "Report is finalized"}, status=STATUS.HTTP_400_BAD_REQUEST)

        acquired, info = acquire_report_lock(
            report.id, 
            request.user.id,
            subject_id
        )

        acquired, info = acquire_report_lock(report.id, request.user.id, subject_id)
        if not acquired:
            holder_user = User.objects.filter(id=info["holder"]).first()
            holder_name = holder_user.get_full_name() or holder_user.email or holder_user.id
            
            if info["locked_on"] == "subject":
                message = f"{holder_name} is editing another report for this subject."
            else:
                message = f"{holder_name} is currently editing this report."

            return Response({"detail": message, "locked_on": info["locked_on"]}, status=STATUS.HTTP_423_LOCKED)

        return Response({"detail": "Lock acquired"}, status=STATUS.HTTP_200_OK)

    @action(url_path="release-report-lock", detail=True, methods=['POST'])
    def release_lock(self, request, *args, **kwargs):
        report = self.get_object()
        subject_id  = report.subject.id

        if report.status == Report.StatusChoices.FINALIZED:
            return Response({"detail" : "Report is finalized"}, status=STATUS.HTTP_400_BAD_REQUEST)
            
        release_report_lock(
            report_id=report.id,
            user_id=request.user.id,
            subject_id=subject_id
        )
        return Response(status=STATUS.HTTP_200_OK)  
    
    @action(url_path="refresh-dual-lock", detail=True, methods=['POST'])
    def refresh_lock(self, request, *args, **kwargs):
        report = self.get_object()
        subject_id = report.subject.id

        refreshed = refresh_report_lock(
            report_id=report.id,
            user_id=request.user.id,
            subject_id=subject_id,
        )
        if refreshed:
            return Response({"detail": "Lock refreshed"}, status=STATUS.HTTP_200_OK)

        return Response(
            {"detail": "Lock lost or expired — someone else may now be editing."},
            status=STATUS.HTTP_409_CONFLICT,
        )
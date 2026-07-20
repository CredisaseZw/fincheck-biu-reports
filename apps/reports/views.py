import redis
import logging
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from django.conf import settings
from apps.utils.base_viewset import BaseJSONViewSet
from apps.reports.models import Report
from apps.companies.models import Company
from apps.individuals.models import Individuals
from .serializers import ReportSerializer, ListReportSerializer
from rest_framework import status as STATUS
from apps.utils.base_viewset import BaseListDataViewSet
from rest_framework.decorators import action
from django.db import transaction
from django.utils import timezone
from datetime import date, timedelta
from django.db.models import Q, Count
from collections import Counter
from apps.utils.permissions import IsStaffUser
from django_filters.rest_framework import DjangoFilterBackend
from apps.reports.GenerateReport import FincheckReportPDF
from apps.users.models import User
from .filters import (
    ReportSearchFilter,
    ReportsFilter, 
    BusinessReportsSearchFilter
)
from .lock_management import (
    acquire_report_lock,
    refresh_report_lock,
    release_report_lock
)
from apps.utils.helpers import (
    get_content_type_id,
    bucket_date_range,
    bucket_for_date    
)

logger = logging.getLogger(__name__)
r = redis.from_url(settings.REDIS_CACHE_LOCATION)
class ReportViewSet(BaseJSONViewSet):
    filter_backends = [ReportSearchFilter, DjangoFilterBackend]
    queryset = Report.objects.filter().exclude(status=Report.StatusChoices.FINALIZED)
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
        subject_unique_id = request.data.get("subject_unique_id", None)
        bypass_check = request.data.get("bypass_check", False)

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
        
        with transaction.atomic():
            if not bypass_check and subject_unique_id:
                client = Company.objects.filter(
                    id = subject_id,
                    registration_number = subject_unique_id.strip()
                ).first() if subject_type == "company" else Individuals.objects.filter(
                    id = subject_id,
                    national_id = subject_unique_id.strip().replace("-", "").replace(" ", "").upper()
                ).first()

                if not client:
                    return Response({
                        "error":  "Given Subject ID does not match with the subjects",
                    }, 
                        status=STATUS.HTTP_409_CONFLICT
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

class ArchivedReportsViewSet(BaseListDataViewSet):
    queryset = Report.objects.filter(
        status = Report.StatusChoices.FINALIZED
    )
    filter_backends = [BusinessReportsSearchFilter, DjangoFilterBackend]
    serializer_class = ReportSerializer

    def cutoff_day(self, request):
        return int(request.query_params.get("month_end_date", 25))

    def _year(self, request):
        return int(request.query_params.get("year", date.today().year))

    @action(detail=False, methods=["get"])
    def monthly_summary(self, request):
        cutoff = self.cutoff_day(request)
        year = self._year(request)

        range_start = date(year, 1, 1) - timedelta(days=31)
        range_end = date(year, 12, 31) + timedelta(days=31)

        instance = self.filter_queryset(self.get_queryset()).filter(
            created_at__date__gte=range_start,
            created_at__date__lte=range_end,
        )

        counter = Counter()
        for dt in instance.values_list("created_at", flat=True):
            b_year, b_month = bucket_for_date(dt, cutoff)
            if b_year == year:
                counter[(b_year, b_month)] += 1

        results = [
            {
                "year": y,
                "label": f"{date(y, m, 1):%b} - {cutoff}",
                "count": count,
                "month" : m
            }
            for (y, m), count in sorted(counter.items(), reverse=True)
        ]
        return Response(results)
    
    @action(detail=False, methods=["get"])
    def by_month(self, request):
        year = int(request.query_params["year"])
        month = int(request.query_params["month"])
        cutoff = self.cutoff_day(request)

        start, end = bucket_date_range(year, month, cutoff)
        instance = self.filter_queryset(self.get_queryset()).filter(
            created_at__date__gte=start, created_at__date__lte=end
        )

        # page = self.paginate_queryset(instance)
        # serializer = self.get_serializer(page or instance, many=True)
        # return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)

        serializer = self.get_serializer(instance, many = True)
        return Response(serializer.data, status=STATUS.HTTP_200_OK)

class DashboardStats(ViewSet):
    permission_classes = [IsStaffUser]

    def period_stats(self,since):
        qs = Report.objects.filter(created_at__gte=since)
        agg = qs.aggregate(
            active=Count("id", filter=~Q(status=Report.StatusChoices.FINALIZED)),
            finalized=Count("id", filter=Q(status=Report.StatusChoices.FINALIZED)),
        )
        return agg
    
    def list(self, request, *args, **kwargs):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        data = {
            "today": self.period_stats(today_start),
            "this_month": self.period_stats(month_start),
            "this_year": self.period_stats(year_start),
        }

        return Response(data)
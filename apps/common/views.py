from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import CreateModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status as STATUS
from apps.utils.permissions import IsStaffUser
from apps.utils.helpers import validate_serializer, get_content_type_id
from .models import Financials, TradeReferences, BankerAccounts
from .serializer import FinancialsSerializer, FinancialsWriteSerializer
from apps.utils.base_viewset import UpdatedByMixin
from .models import FinancialFiles
from pydantic import ValidationError as PydanticValidationError
from rest_framework.permissions import AllowAny
from .report_types import (
    CompanyReportSchema,
    IndividualReportSchema,
    ReportType
)
from .ingest import save_company, save_individual
from rest_framework.decorators import action
import logging
logger = logging.getLogger(__name__)

class FinancialsViewSet(
    GenericViewSet,
    CreateModelMixin,
    UpdateModelMixin,
    UpdatedByMixin
):
    permission_classes = [IsStaffUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Financials.objects.prefetch_related("financial_files").all()
    serializer_class = FinancialsSerializer

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return FinancialsWriteSerializer
        return FinancialsSerializer

    def _handle_financial_files(self, request, instance):
        # Handle updates to existing files
        for key in request.data.keys():
            if key.startswith('existing_files[') and key.endswith('].id'):
                idx = key.split('[')[1].split(']')[0]
                file_id = request.data.get(key)
                title = request.data.get(f'existing_files[{idx}].file_title')
                if file_id and title is not None:
                    FinancialFiles.objects.filter(id=file_id, financial=instance).update(file_title=title)

        # Handle new files
        for key in request.data.keys():
            if key.startswith('new_files_titles['):
                idx = key.split('[')[1].split(']')[0]
                title = request.data.get(key)
                file_obj = request.FILES.get(f'new_files[{idx}]')
                
                if file_obj and getattr(file_obj, 'size', 0) == 0 and file_obj.name == 'empty':
                    file_obj = None

                if title or file_obj:
                    FinancialFiles.objects.create(
                        financial=instance,
                        file=file_obj,
                        file_title=title
                    )

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        
        content_type_id = get_content_type_id(
            data.get("subject_object_id"),
            data.get("subject_type")
        )

        if not content_type_id:
            return Response(
                {"error": "Invalid subject_object_id or subject_type."},
                status=STATUS.HTTP_400_BAD_REQUEST
            )

        data["subject_content_type"] = content_type_id
        serializer = FinancialsWriteSerializer(data=data)
        error = validate_serializer(serializer=serializer)
        if error:
            return error
        instance = self.perform_create(serializer=serializer)
        
        self._handle_financial_files(request, instance)
        
        return Response(
            FinancialsSerializer(serializer.instance).data,
            status=STATUS.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()

        if subject_object_id := data.get("subject_object_id"):
            content_type_id = get_content_type_id(
                subject_object_id,
                data.get("subject_type")
            )
            if not content_type_id:
                return Response(
                    {"error": "Invalid subject_object_id or subject_type."},
                    status=STATUS.HTTP_400_BAD_REQUEST
                )
            data["subject_content_type"] = content_type_id

        serializer = FinancialsWriteSerializer(
            instance,
            data=data,
            partial=True,
            context={"request": request}
        )
        error = validate_serializer(serializer=serializer)
        if error:
            logger.error(f"Validation error in FinancialsViewSet.update: {serializer.errors}")
            return error

        self.perform_update(serializer=serializer)
        self._handle_financial_files(request, instance)
        
        # Refresh instance to get updated files
        instance.refresh_from_db()
        return Response(
            FinancialsSerializer(serializer.instance).data,
            status=STATUS.HTTP_200_OK
        )

class DeleteFinancialFile(GenericViewSet, DestroyModelMixin):
    queryset = FinancialFiles.objects.all()
    permission_classes = [IsStaffUser]
class DeleteTradeReferenceViewSet(GenericViewSet, DestroyModelMixin):
    queryset =  TradeReferences.objects.all()
    permission_classes = [IsStaffUser]

class DeleteBankerAccounts(GenericViewSet, DestroyModelMixin):
    queryset = BankerAccounts.objects.all()
    permission_classes = [IsStaffUser]


class IngestionViewSet(GenericViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, url_path='ingest', methods=['POST'])
    def ingest_end_point(self, request, *args, **kwargs):
        report_type = request.data.get("report_type")
        payload = request.data.get("payload")

        if not report_type:
            return Response({
              "error" : "Report type required."  
            }, status=STATUS.HTTP_400_BAD_REQUEST)

        if report_type not in (ReportType.INDIVIDUAL.value, ReportType.COMPANY.value):
            return Response(
                {"detail": "report_type must be 'individual' or 'company'."},
                status=STATUS.HTTP_400_BAD_REQUEST,
            )

        schema_cls = (
            IndividualReportSchema 
            if report_type == ReportType.INDIVIDUAL.value
            else CompanyReportSchema
        )

        try:
            parsed = schema_cls.model_validate(payload)
        except PydanticValidationError as exc:
            logger.error("Ingest schema validation failed: %s", exc)
            return Response(
                {"detail": "Schema validation failed.", "errors": exc.errors()},
                status=STATUS.HTTP_400_BAD_REQUEST,
            )

        try:   
            if report_type == ReportType.INDIVIDUAL.value:
                instance = save_individual(parsed)
            else:
                instance = save_company(parsed)
        except Exception as exc:
            identifier = (
                getattr(parsed, "national_id", None)
                or getattr(parsed, "registered_name", None)
                or "unknown"
            )
            logger.exception(
                "Failed to save %s report to DB — identifier=%s, error=%s: %s",
                report_type, identifier, type(exc).__name__, exc,
            )
            return Response(
                {
                    "detail": "Failed to save report.",
                    "error": f"{type(exc).__name__}: {exc}",
                    "identifier": str(identifier),
                },
                status=STATUS.HTTP_500_INTERNAL_SERVER_ERROR,
            )
 
        return Response(
            {"id": str(instance.pk), "report_type": report_type},
            status=STATUS.HTTP_201_CREATED,
        )
 
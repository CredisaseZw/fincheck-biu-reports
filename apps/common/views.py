from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import CreateModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status as STATUS
from apps.utils.permissions import IsStaffUser
from apps.utils.helpers import validate_serializer, get_content_type_id
from .models import Financials, TradeReferences, BankerAccounts
from .serializer import FinancialsSerializer, FinancialsWriteSerializer
import logging

logger = logging.getLogger(__name__)

class FinancialsViewSet(
    GenericViewSet,
    CreateModelMixin,
    UpdateModelMixin,
):
    permission_classes = [IsStaffUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Financials.objects.all()
    serializer_class = FinancialsSerializer

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return FinancialsWriteSerializer
        return FinancialsSerializer

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
            logger.error(f"Validation error in FinancialsViewSet.create: {serializer.errors}")
            return error

        serializer.save()
        return Response(
            FinancialsSerializer(serializer.instance).data,
            status=STATUS.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()

        if "financials_file" in request.FILES:
            if instance.financials_file:
                instance.financials_file.delete(save=False)

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

        serializer.save()
        return Response(
            FinancialsSerializer(serializer.instance).data,
            status=STATUS.HTTP_200_OK
        )
    
class DeleteTradeReferenceViewSet(GenericViewSet, DestroyModelMixin):
    queryset =  TradeReferences.objects.all()
    permission_classes = [IsStaffUser]

class DeleteBankerAccounts(GenericViewSet, DestroyModelMixin):
    queryset = BankerAccounts.objects.all()
    permission_classes = [IsStaffUser]
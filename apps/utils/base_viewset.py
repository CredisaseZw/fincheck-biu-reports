from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.utils.permissions import IsStaffUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import ListModelMixin

class UpdatedByMixin:
    def perform_create(self, serializer):
        instance = serializer.save(updated_by=self.request.user)
        return instance

    def perform_update(self, serializer):
        instance = serializer.save(updated_by=self.request.user)
        return instance
class ValidatedCreateUpdateMixin:
    
    def create(self, request, *args, **kwargs):
        from apps.utils.helpers import validate_serializer

        serializer = self.get_serializer(data=request.data)
        error = validate_serializer(serializer)
        if error:
            return error
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        from apps.utils.helpers import validate_serializer
        
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        error = validate_serializer(serializer)
        if error:
            return error
        self.perform_update(serializer)
        return Response(serializer.data)
    
class BaseJSONViewSet(UpdatedByMixin, ValidatedCreateUpdateMixin, ModelViewSet):
    permission_classes = [IsStaffUser]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    ordering = ["-created_at"]

class BaseFormDataViewSet(UpdatedByMixin, ValidatedCreateUpdateMixin, ModelViewSet):
    permission_classes = [IsStaffUser]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    ordering = ["-created_at"]

class BaseListDataViewSet(ListModelMixin, GenericViewSet):
    permission_classes = [IsStaffUser]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    ordering = ["-created_at"]

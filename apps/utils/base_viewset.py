from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.utils.permissions import IsStaffUser
from rest_framework.parsers import MultiPartParser, FormParser
from apps.utils.helpers import validate_serializer
from rest_framework.response import Response
from rest_framework import status

class BaseJSONViewSet(ModelViewSet):
    permission_classes = [IsStaffUser]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    ordering = ["-created_at"]

    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        error = validate_serializer(serializer)
        if error:
            return error
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        error = validate_serializer(serializer)
        if error:
            return error
        self.perform_update(serializer)
        return Response(serializer.data)

class BaseFormDataViewSet(ModelViewSet):
    permission_classes = [IsStaffUser]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    ordering = ["-created_at"]
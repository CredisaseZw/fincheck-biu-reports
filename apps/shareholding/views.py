from rest_framework.mixins import RetrieveModelMixin, CreateModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet
from apps.utils.helpers import validate_serializer
from rest_framework import status as STATUS
from rest_framework.response import Response
from .serializers import CompanyShareholdingsSerializer, ShareholderSerializer, ShareholdingsSerializers
from .models import CompanyShareholding, Shareholder

# Create your views here.
class CompanyShareHoldersViewSet(
        GenericViewSet,
        RetrieveModelMixin, 
        CreateModelMixin,
        UpdateModelMixin
    ):
    queryset = CompanyShareholding.objects.prefetch_related(
        "shareholders"
    ).select_related("company").all()
    serializer_class = CompanyShareholdingsSerializer

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ShareholdingsSerializers
        return CompanyShareholdingsSerializer
    
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        shareholders_data = data.pop("shareholders", [])

        serializer = self.get_serializer( data=data )
        error = validate_serializer(serializer=serializer)
        if error:
            return error

        instance = serializer.save()

        for shareholder in shareholders_data:
            shareholder['shareholding'] = instance.id
            serializer = ShareholderSerializer(data = shareholder)
            error = validate_serializer(serializer=serializer)
            if error:
                return error

            serializer.save()

        instance.refresh_from_db()
        return Response(
            ShareholdingsSerializers(instance).data,
            status=STATUS.HTTP_201_CREATED
        )            

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()
        shareholders_data = data.pop("shareholders", [])

        if any(
            data.get(field) is not None
            for field in ["numbers_of_shares", "numbers_of_shareholders"]
        ):
            serializer = self.get_serializer(
                instance,
                data=data,
                partial=True,
                context = {'request': request}
            )
            error = validate_serializer(serializer=serializer)
            if error:
                return error
            serializer.save()
        
        for holder in shareholders_data:
            holder_instance = Shareholder.objects.filter(pk = holder.pop("id", None)).first()
            if holder_instance: 
                serializer = ShareholderSerializer(
                  holder_instance,
                  data = holder,
                  partial = True,
                  context = {'request': request}
                )
                error = validate_serializer(serializer=serializer)
                if error:
                    return error

                serializer.save()
            else:
                holder['shareholding'] = instance.id
                serializer = ShareholderSerializer(data = holder)
                error = validate_serializer(serializer=serializer)
                if error:
                    return error
                
                serializer.save()

        instance.refresh_from_db()
        return Response(
            ShareholdingsSerializers(instance).data,
            status=STATUS.HTTP_200_OK
        )
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import DestroyModelMixin, RetrieveModelMixin
from apps.utils.permissions import IsStaffUser
from apps.companies.models import Company
from .models import CompanyDirector
from rest_framework import status as STATUS
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import CompanyDirectorSerializer, DirectorSerializer
# Create your views here.
class DirectorsViewSet(GenericViewSet, RetrieveModelMixin):
    serializer_class = CompanyDirectorSerializer
    queryset = Company.objects.prefetch_related(
        "directors"
    ).filter(is_deleted = False)
    ordering_fields = ["created_at"]
    # search (add if required)? 

    @action(url_path="directors", methods=["PATCH"], detail=True)   
    def update_create_directors(self, request, *args, **kwargs):
        company = self.get_object()
        directors = request.data.get("directors", None)

        if not directors:
            return Response(
                {"error": "Directors required."},
                status=STATUS.HTTP_400_BAD_REQUEST
            )

        for director in directors:
            instance = CompanyDirector.objects.filter(pk=director.pop("id")).first()
            if instance:
                serializer = DirectorSerializer(instance, data=director, partial=True)
            else:
                director["company"] = company.id
                serializer = DirectorSerializer(data=director)

            error = validate_serializer(serializer=serializer)
            if error:
                return error
            serializer.save()

        company.refresh_from_db()
        return Response(
            CompanyDirectorSerializer(instance=company).data,
            status=STATUS.HTTP_200_OK
        )
class CompanyDirectorViewSet(DestroyModelMixin, GenericViewSet):
    queryset = CompanyDirector.objects.all()
    serializer_class = DirectorSerializer
    permission_classes = [IsStaffUser]


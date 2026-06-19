from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status
from apps.companies.models import Company
from apps.individuals.models import Individuals
from django.contrib.contenttypes.models import ContentType

def clean_error(error):
    if isinstance(error, serializers.ValidationError):
        detail = error.detail
    else:
        detail = error

    if isinstance(detail, dict) and detail:
        field = next(iter(detail))
        message = clean_error(detail[field])
        return f"[{field.replace('_', ' ').title()}] {message}"

    if isinstance(detail, list) and detail:
        return clean_error(detail[0])

    return str(detail)

def validate_serializer(serializer):
    """
    Cleans general serializers errors and returns the Response
    :param serializer: Validation Serializer
    """
    try:
        serializer.is_valid(raise_exception=True)
    except serializers.ValidationError as e:
        message = clean_error(e)
        return Response(
            {"error": message},
            status=status.HTTP_400_BAD_REQUEST
        )
    return None

def get_content_type_id(subject_object_id, subject_type: str) -> int | None:
    model_map = {
        "company": Company,
        "individual": Individuals,
    }

    model = model_map.get(subject_type)
    if not model:
        return None

    subject = model.objects.filter(pk=subject_object_id).first()
    if not subject:
        return None

    return ContentType.objects.get_for_model(subject).id
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status

def clean_error(error):
    if isinstance(error, serializers.ValidationError):
        detail = error.detail
    else: 
        detail = error

    if isinstance(detail, dict) and detail:
        return clean_error(next(iter(detail.values())))

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

from .models import User
from rest_framework import status as STATUS
from rest_framework.response import Response
from apps.utils.permissions import IsStaffUser
from rest_framework.permissions import AllowAny, SAFE_METHODS
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from .serializers import UserSignInSerializers, CreateUserSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from apps.utils.helpers import validate_serializer

# Create your views here.
@api_view(['POST'])
@permission_classes([AllowAny])
def auth_user(request, *args, **kwargs):
    serializer = UserSignInSerializers(data = request.data)
    error_message = validate_serializer(serializer=serializer)
    if error_message:
        return error_message

    data = serializer.validated_data
    user = data.get('user', {})

    return Response({
        **UserSerializer(instance = user).data,
        'tokens': {
            'access': data.get("token").get('access'),
            'refresh': data.get("token").get('refresh'),
        }
    }, status = STATUS.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request, *args, **kwargs):
    refresh = request.data.get("refresh", None)
    if not refresh:
        return Response({"error": "Refresh token is required."}, status=STATUS.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh)
        return Response({
            "access": str(token.access_token),
            "refresh": str(token),
        }, status=STATUS.HTTP_200_OK)
    except TokenError as e:
        return Response({"error": str(e)}, status=STATUS.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsStaffUser])
def verify_token(request, *args, **kwargs):
    return Response({
        "message" : "User valid"
    }, status= STATUS.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsStaffUser])
def create_user(request, *args, **kwargs):
    serializer = CreateUserSerializer(data = request.data)
    error = validate_serializer(serializer=serializer)
    if error:
        return error
    
    user = User.objects.create_user(**serializer.validated_data)
    return Response(UserSerializer(user).data, status=STATUS.HTTP_201_CREATED)


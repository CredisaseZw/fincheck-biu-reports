from .models import User, Enquiries
from rest_framework import status as STATUS
from rest_framework.response import Response
from apps.utils.permissions import IsStaffUser
from apps.utils.base_viewset import UpdatedByMixin, BaseAuthJSONViewSet
from rest_framework.viewsets import GenericViewSet
from django.contrib.contenttypes.models import ContentType
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, DestroyModelMixin, UpdateModelMixin
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from .serializers import UserSignInSerializers, CreateUserSerializer, UserSerializer, ChangePasswordSerializer, EnquirySerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework_simplejwt.exceptions import TokenError
from apps.users.filters import UsersSearchFilter, UserFilterSet
from apps.utils.helpers import validate_serializer, get_content_type_id
import logging

logger = logging.getLogger(__name__)

# Create your views here.
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
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
        logger.error(f"Token refresh failed: {e}", exc_info=True)
        return Response({"error": str(e)}, status=STATUS.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_token(request, *args, **kwargs):
    return Response({
        "message" : "User valid"
    }, status= STATUS.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsStaffUser])
def create_internal_user(request, *args, **kwargs):
    serializer = CreateUserSerializer(data = request.data)
    error = validate_serializer(serializer=serializer)
    if error:
        return error
    
    user = User.objects.create_user(**serializer.validated_data, is_staff = True)
    return Response(UserSerializer(user).data, status=STATUS.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsStaffUser])
def create_external_user(request, *args, **kwargs):
    data = request.data
    client_type = data.get("client_type", None)
    client_id = data.get("client_id", None)
    email = str(data.get("email"))
    password = data.get("password", None)

    if not client_type or not client_id:
        return Response({
            "error" : "Client data required."
        }, status=STATUS.HTTP_400_BAD_REQUEST)

    if not email:
        return Response({
            "error" : "Email is required."
        }, status=STATUS.HTTP_400_BAD_REQUEST)        

    if not password:
        return Response({
            "error" : "Password is required."
        }, status=STATUS.HTTP_400_BAD_REQUEST)        

    user = User.objects.filter(email = email).first()
    if user:
        return Response({
            "error" : "Client with email already exists."
        }, status=STATUS.HTTP_400_BAD_REQUEST)        


    client_content_type_id = get_content_type_id(client_id, client_type)

    user = User.objects.filter(
        client_object_id=client_id,
        client_content_type_id=client_content_type_id,
    ).first()
    if user:
        return Response({
            "error" : "Client already activated as user."
        }, status=STATUS.HTTP_400_BAD_REQUEST)        
    
    user = User.objects.create_user(
        client_object_id=client_id,
        client_content_type_id=client_content_type_id,
        password=password,
        email=email,
    )
    user.is_staff= False
    user.save()

    return Response(UserSerializer(user).data, status=STATUS.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request, *args, **kwargs):
    serializer = ChangePasswordSerializer(data=request.data, context={"user": request.user})
    error = validate_serializer(serializer=serializer)
    if error:
        return error
    
    request.user.set_password(serializer.validated_data["new_password"])
    request.user.save()

    return Response({"message": "Password changed successfully."}, status=STATUS.HTTP_200_OK)

class UsersViewset(
    UpdatedByMixin,
    UpdateModelMixin,
    ListModelMixin,
    RetrieveModelMixin,
    DestroyModelMixin,
    GenericViewSet
):
    permission_classes = [IsStaffUser]
    filter_backends = [DjangoFilterBackend, OrderingFilter, UsersSearchFilter]
    queryset = User.objects.all()
    filterset_class = UserFilterSet
    ordering = ["-created_at"]
    serializer_class = UserSerializer

    def perform_update(self, serializer):
        password = self.request.data.get("password", None)
        is_active = self.request.data.get("is_active", None)
        instance = serializer.save()
        changed = False
        if password:
            instance.set_password(password)
            changed = True
        if is_active is not None:
            instance.is_active = is_active
            changed = True
        if changed:
            instance.save()

class EnquiriesViewSet(BaseAuthJSONViewSet):
    serializer_class = EnquirySerializer
    queryset = Enquiries.objects.prefetch_related(
        "enquiries",
        "enquiry_client"
    ).all()

    def get_permissions(self):
        if self.action in ["list", "retrieve", "update", "destroy"]:
            return [IsStaffUser()]
        else:
            return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        user:User = request.user
        client_object_id = request.data.get("client_object_id", None)
        client_type = request.data.get("client_type", None)

        if not client_type:
            return Response({
                "error" : "Invalid client type."
            }, status=STATUS.HTTP_400_BAD_REQUEST)
        
        if not client_object_id:
            return Response({
                "error" : "Invalid client id."
            }, status=STATUS.HTTP_400_BAD_REQUEST)    

        content_type_id = get_content_type_id(client_object_id, client_type)
        client_content_type = ContentType.objects.get(id=content_type_id)

        enquiry = Enquiries.objects.create(
            enquirer=user,
            client_content_type=client_content_type,
            client_object_id=client_object_id,
        )

        return Response(EnquirySerializer(enquiry).data, status=STATUS.HTTP_200_OK)
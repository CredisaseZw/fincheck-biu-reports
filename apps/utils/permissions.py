
import hmac
from django.conf import settings
from rest_framework.permissions import BasePermission

class IsStaffUser(BasePermission):
    message = "Only Staff users can access this endpoint."

    def has_permission(self, request, view):
        return (
            bool(
                request.user and
                request.user.is_authenticated and
                ( request.user.is_staff or request.user.is_superuser )
            )
        )
class HasSecretHeader(BasePermission):
    header_name = "X-API-Secret"
    message = "Invalid or missing secret header."

    def has_permission(self, request, view):
        expected = getattr(settings, "TOKEN_FREE_API_SECRET", "")
        if not expected: 
            return False

        provided = request.headers.get(self.header_name, "")
        return hmac.compare_digest(provided.encode(), expected.encode())
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
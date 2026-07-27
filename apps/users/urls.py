from django.urls import path,include
from .views import (
    auth_user,
    refresh_token,
    create_internal_user, 
    create_external_user,
    verify_token,
    change_password,
    UsersViewset,
    EnquiriesViewSet
)
from rest_framework.routers import SimpleRouter

router = SimpleRouter()
router.register(r'users', UsersViewset, basename="users")
router.register(r'enquiries', EnquiriesViewSet, basename='enquiries')

urlpatterns = [
    path("auth/login/", auth_user, name="auth-login"),
    path("auth/refresh/", refresh_token, name="auth-refresh"),
    path("users/register-internal/", create_internal_user, name="auth-register"),
    path("users/register-external/", create_external_user, name="register"),
    path("auth/verify-token/", verify_token, name="auth-verify_token"),
    path("auth/change-password/", change_password, name="auth-change-password"),
    path("", include(router.urls))
]
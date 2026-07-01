from django.urls import path
from .views import auth_user, refresh_token, create_user, verify_token, change_password

urlpatterns = [
    path("auth/login/", auth_user, name="auth-login"),
    path("auth/refresh/", refresh_token, name="auth-refresh"),
    path("auth/register/", create_user, name="auth-register"),
    path("auth/verify-token/", verify_token, name="auth-verify_token"),
    path("auth/change-password/", change_password, name="auth-change-password"),
]
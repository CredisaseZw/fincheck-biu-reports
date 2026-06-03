from django.urls import path
from .views import auth_user, refresh_token, create_user

urlpatterns = [
    path("auth/login/", auth_user, name="auth-login"),
    path("auth/refresh/", refresh_token, name="auth-refresh"),
    path("auth/register/", create_user, name="auth-register"),
]
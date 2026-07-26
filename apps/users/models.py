from apps.utils.user_manager import UserManager   
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
class User(AbstractUser):
    username = None

    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    client_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="user_client",
        null=True,
        blank=True
    )
    client_object_id = models.PositiveIntegerField(
        null=True,
        blank=True
    )
    client = GenericForeignKey(
        "client_content_type", 
        "client_object_id"
    )
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)
     
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = UserManager()    
    class Meta:
        indexes = [
            models.Index(
                fields=["first_name", "last_name", "email"]
            )
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}: {'Client' if not self.is_staff else 'Admin'}"

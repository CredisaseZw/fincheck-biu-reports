from apps.common.user_manager import UserManager   
from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    
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

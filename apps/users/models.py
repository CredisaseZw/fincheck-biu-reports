from apps.utils.user_manager import UserManager   
from django.db import models
from django.contrib.auth.models import AbstractUser
class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
        
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

from apps.users.models import User
from django.core.management import BaseCommand
from uuid import uuid4

class Command(BaseCommand):
    help = "Seed the default admin and superuser"

    def handle(self, *args, **options):
        users = [
            {   
                "first_name" : "Admin",
                "last_name": "Admin",
                "email": "admin@admin.com",
                "password": "admin",
                "is_staff": True,
                "is_superuser": False,
                "label": "Default admin",
            },
            {
                "first_name" : "Fincheck",
                "last_name": "Admin",
                "email": "gilbert2klopah@gmail.com",
                "password": "admin",
                "is_staff": True,
                "is_superuser": True,
                "label": "Superuser",
            },
        ]

        for u in users:
            if User.objects.filter(email=u["email"]).exists():
                self.stdout.write(self.style.WARNING(f"{u['label']} already exists."))
                continue

            User.objects.create_user(
                email=u["email"],
                password=u["password"],
                is_staff=u["is_staff"],
                is_superuser=u["is_superuser"],
            )
            self.stdout.write(self.style.SUCCESS(f"{u['label']} successfully created."))
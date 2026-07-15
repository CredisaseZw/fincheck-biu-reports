import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.reports.models import Report  
from apps.companies.models import Company       
from apps.individuals.models import Individuals 

User = get_user_model()

FAKE_NAMES = [
    "Tinashe Mudzingwa", "Rutendo Chirwa", "Kudzai Mangena",
    "Anesu Chitima", "Simbarashe Gwenzi", "Vimbai Marufu",
]

RATINGS = ["AAA", "+AA", "AA", "BC", "AD", "2BA", "DD", "F-"]

class Command(BaseCommand):
    help = "Seed fake Report rows with past dates for dev/testing"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=40)
        parser.add_argument("--months-back", type=int, default=14)

    def handle(self, *args, **options):
        count = options["count"]
        months_back = options["months_back"]

        companies = list(Company.objects.all())
        individuals = list(Individuals.objects.all())
        if not companies or not individuals:
            self.stderr.write("No companies/individuals found — seed those first.")
            return

        company_ct = ContentType.objects.get_for_model(Company)
        individual_ct = ContentType.objects.get_for_model(Individuals)
        user = User.objects.first()  
    
        now = timezone.now()
        created = []

        for _ in range(count):
            if random.random() < 0.6:
                subject = random.choice(companies)
                subject_ct = company_ct
            else:
                subject = random.choice(individuals)
                subject_ct = individual_ct

            client = random.choice(companies)
            username = random.choice(FAKE_NAMES)

            report = Report.objects.create(
                subject_object_id=subject.id,
                subject_content_type_id=subject_ct.id,
                client_object_id=client.id,
                client_content_type_id=company_ct.id,
                username=username,
                status=Report.StatusChoices.FINALIZED,
                updated_by=user,
            )

            days_back = random.randint(0, months_back * 30)
            fake_created = now - timedelta(
                days=days_back,
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
            )

            update_fields = {"created_at": fake_created}
            update_fields["finalized_at"] = fake_created + timedelta(
                hours=random.randint(1, 48)
            )
            if hasattr(report, "rating"):
                update_fields["rating"] = random.choice(RATINGS)

            Report.objects.filter(pk=report.pk).update(**update_fields)
            created.append(report.pk)

        self.stdout.write(
            self.style.SUCCESS(f"Seeded {len(created)} reports across {months_back} months back.")
        )
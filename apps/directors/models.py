from django.db import models
from django.db.models import UniqueConstraint
from apps.utils.base_models import BaseModel
from apps.companies.models import Company
from django.utils.translation import gettext_lazy as _

# Create your models here.
class CompanyDirector(BaseModel):
    class DirectorGender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
    
    class Positions(models.TextChoices):
        DIRECTOR = "director", "Director"
        SECRETARY = "secretary", "Secretary"
        CHAIRMAN = "chairman", "Chairman"
        OTHER = "other", "Other"

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='directors'
    )
    individual = models.ForeignKey(
        "individuals.Individuals",
        on_delete=models.SET_NULL,
        related_name='directorship',
        blank=True,
        null=True
    )
    position = models.CharField(
        max_length=20,
        choices=Positions.choices,
        default=Positions.DIRECTOR,
        help_text=_("Director position in the company")
    )
    class Meta:
        ordering = ["-created_at"]
        db_table = 'company_directors'
        verbose_name = "Company Director"
        verbose_name_plural = "Company Directors"

    def __str__(self):
        return f"{self.individual.full_name} | ({self.company})"
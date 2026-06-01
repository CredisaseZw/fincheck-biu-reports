from django.db import models
from django.db.models import UniqueConstraint
from apps.common.common_models import BaseModelWithClient
from apps.companies.models import Company
from django.utils.translation import gettext_lazy as _

# Create your models here.
class CompanyDirector(BaseModelWithClient):
    class DirectorGender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
    
    class Positions(models.TextChoices):
        DIRECTOR = "director", "Director"
        SECRETARY = "secretary", "Secretary"
        OTHER = "other", "Other"

    full_name = models.CharField(
        max_length=50,
        help_text=_("Director full name")
    )
    position = models.CharField(
        max_length=20,
        choices=Positions.choices,
        default=Positions.DIRECTOR,
        help_text=_("Director position in the company")
    )
    gender = models.CharField(
        max_length=10,
        choices=DirectorGender.choices,
        default=DirectorGender.MALE
    )
    dob = models.DateTimeField(help_text= _("Director Date of birth"))
    address_latest = models.TextField(help_text= _("Director Primary Address"))
    address_prev = models.TextField(help_text= _("Director Prev Address"))
    email = models.EmailField(
        max_length=50,
        blank=True, 
        null=True,
        help_text=_("Director Email"),
    )
    mobile_phone_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text=_("Director Mobile Phone Number")
    )
    
    class Meta:
        ordering = ["-number_of_shares"]
        db_table = 'company_directors'
        verbose_name = "Company Director"
        verbose_name_plural = "Company Directors"
        constraints = [
            UniqueConstraint(
                fields= ['company__registered_name', 'full_name'],
                name='unique_director_per_company'
            )
        ]

    def __str__(self):
        return f"{self.name} | ({self.company})"

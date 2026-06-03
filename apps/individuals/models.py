from django.utils.translation import gettext_lazy as _
from django.db import models
from apps.utils.base_models import BaseModel
from django.db.models import UniqueConstraint

class Individuals(BaseModel):
    class ReferType(models.TextChoices):
        BIU = "biu", "BIU"
        FP3 = "fp3", "FP3"
        RENTSAFE = "rentsafe", "Rentsafe"
    class MaritalStatus(models.TextChoices):
        SINGLE = "single", "Single"
        MARRIED = "married", "Married"
        DIVORCED = "divorced", "Divorced"
        WIDOWED = "widowed", "Widowed"
    
    full_name = models.CharField(_("Full name"), max_length=255)
    national_id = models.CharField(_("National ID / Passport"), max_length=100, unique=True)
    date_of_birth = models.DateField(_("Date of birth"))
    gender = models.CharField(_("Gender"), max_length=50)
    marital_status = models.CharField(
        _("Marital status"), 
        max_length=50,
        default= MaritalStatus.SINGLE,
        choices=MaritalStatus.choices
    )
    status = models.CharField(_("Status"), max_length=50, blank=True, null=True)
    nationality = models.CharField(_("Nationality"), max_length=100)
    residential_address = models.TextField(_("Residential address"))
    postal_address = models.TextField(_("Postal address"), blank=True, null=True)
    mobile_number = models.CharField(_("Mobile number"), max_length=50)
    email = models.EmailField(_("Email"), blank=True, null=True)
    refer_type = models.CharField(
        max_length=10,
        choices= ReferType.choices,
        help_text=_("Where was individual data retrieved from, default is BIU."),
        default= ReferType.BIU
    )
    class Meta:
        verbose_name = _("Individual")
        verbose_name_plural = _("Individuals")
        ordering = ["full_name"]
        constraints = [
            UniqueConstraint(
                fields=["national_id"],
                name="unique_national_id"
            ),
        ]

    def __str__(self):
        return f"{self.full_name} | {self.national_id}"

class EmploymentInformation(BaseModel):
    individual = models.OneToOneField(
        Individuals,
        related_name="employment_information",
        on_delete=models.CASCADE,
    )
    employer = models.CharField(_("Employer"), max_length=255, blank=True, null=True)
    position = models.CharField(_("Position"), max_length=255, blank=True, null=True)
    employment_status = models.CharField(_("Employment Status"), max_length=100, blank=True, null=True)
    years_employed = models.PositiveIntegerField(_("Years Employed"), null=True, blank=True)
    monthly_income = models.DecimalField(_("Monthly Income"), max_digits=12, decimal_places=2, blank=True, null=True)
    previous_employer = models.CharField(
        _("Previous Employer"),
        max_length=255,
        blank=True,
        null=True,
    )

    class Meta:
        verbose_name = _("Employment Information")
        verbose_name_plural = _("Employment Informations")
        ordering = ["employer", "position"]

class NextOfKin(BaseModel):
    individual = models.OneToOneField(
        Individuals,
        related_name="next_of_kin",
        on_delete=models.CASCADE,
    )
    name = models.CharField(_("Name"), max_length=255)
    relationship = models.CharField(_("Relationship"), max_length=100)
    contact_number = models.CharField(_("Contact Number"), max_length=50)

    class Meta:
        verbose_name = _("Next of Kin / Reference")
        verbose_name_plural = _("Next of Kin / References")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.relationship})"
    

import re
import django_filters
from django.db.models import Q
from apps.individuals.models import Individuals
from apps.companies.models import Company
from apps.utils.entity_lookup import EntityLookUp 

entity = EntityLookUp()
class CompanySearchFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="filter_search")
    class Meta:
        model = Company
        fields = ["search"]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset

        db_matches = queryset.filter(
            Q(re_registration_number__icontains=value) |
            Q(registered_name__icontains=value) |
            Q(trading_name__icontains=value) |
            Q(registration_number__icontains=value)
        )

        instance = entity.entity_look_up(type="company", value=value)
        if instance:
            db_matches = db_matches | queryset.filter(pk=instance.pk)

        return db_matches.distinct()
    
class IndividualSearchFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="filter_search")
    class Meta:
        model = Individuals
        fields = ["search"]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset

        db_matches = queryset.filter(
            Q(full_name__icontains=value) |
            Q(national_id__icontains=value) |
            Q(email__icontains=value)
        )

        if db_matches.exists():
            return db_matches

        instance = None
        zim_id_pattern = r"^\d{2}-?\d{6}[A-Z]\d{2,3}$"
        if bool(re.match(zim_id_pattern, Individuals.normalize_national_id(value))):
            instance = entity.entity_look_up(type="individual", value=value)

        if instance:
            db_matches = db_matches | queryset.filter(pk=instance.pk)
        return db_matches.distinct()
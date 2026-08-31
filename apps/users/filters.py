from rest_framework.filters import BaseFilterBackend
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from apps.companies.models import Company
from apps.individuals.models import Individuals
import django_filters
from .models import User

class UsersSearchFilter(BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        search = request.query_params.get("search", "").strip()
        if not search:
            return queryset

        company_ct = ContentType.objects.get_for_model(Company)
        individual_ct = ContentType.objects.get_for_model(Individuals)

        company_ids = Company.objects.filter(
            Q(registered_name__icontains=search) |
            Q(registration_number__icontains=search) |
            Q(trading_name__icontains=search) |
            Q(email__icontains=search)
        ).values_list("id", flat=True)

        individual_ids = Individuals.objects.filter(
            Q(full_name__icontains=search) |
            Q(email__icontains=search)
        ).values_list("id", flat=True)

        return queryset.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search) |
            Q(client_content_type=company_ct, client_object_id__in=company_ids) |
            Q(client_content_type=individual_ct, client_object_id__in=individual_ids)
        ).distinct()
    
class UserFilterSet(django_filters.FilterSet):
    user_type = django_filters.ChoiceFilter(
        choices=(("internal", "Internal"), ("external", "External")),
        method="filter_user_type",
    )
    client_type = django_filters.ChoiceFilter(
        choices=(("company", "Company"), ("individual", "Individual")),
        method="filter_client_type",
    )
    is_active = django_filters.BooleanFilter(field_name="is_active")
    created_at_after = django_filters.DateFilter(
        field_name="created_at", lookup_expr="date__gte"
    )
    created_at_before = django_filters.DateFilter(
        field_name="created_at", lookup_expr="date__lte"
    )

    class Meta:
        model = User
        fields = ["user_type", "client_type", "is_active", "created_at_after", "created_at_before"]

    def filter_user_type(self, queryset, name, value):
        if value == "internal":
            return queryset.filter(is_staff=True)
        if value == "external":
            return queryset.filter(is_staff=False)
        return queryset

    def filter_client_type(self, queryset, name, value):
        if value == "company":
            ct = ContentType.objects.get_for_model(Company)
        elif value == "individual":
            ct = ContentType.objects.get_for_model(Individuals)
        else:
            return queryset
        return queryset.filter(client_content_type=ct)
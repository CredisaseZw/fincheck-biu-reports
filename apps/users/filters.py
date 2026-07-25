from rest_framework.filters import BaseFilterBackend
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from apps.companies.models import Company
from apps.individuals.models import Individuals

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
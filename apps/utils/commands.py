import re
from apps.companies.models import Company
from django.db.models import Q

def clean_registration_names():
    qs = Company.objects.filter(
        Q(registered_name__icontains="T/A") |
        Q(registered_name__icontains="Trading as")
    )

    pattern = re.compile(r"t/a|trading as", re.IGNORECASE)

    for i,c in enumerate(qs):
        print(f"{i + 1} / {qs.count()}")
        name = c.registered_name
        parts = pattern.split(name, maxsplit=1)

        if len(parts) < 2:
            continue  
        c.registered_name = parts[0].strip().upper()
        c.trading_name = parts[1].strip().upper()
        c.save(update_fields=["registered_name", "trading_name"])
import re
from apps.companies.models import Company
from django.db.models import Q


def clean_registration_names():
    qs = Company.objects.filter(
        Q(registered_name__icontains="T/A") |
        Q(registered_name__icontains="Trading as")
    )

    pattern = re.compile(r"t/a|trading as", re.IGNORECASE)

    total = qs.count()
    passed = 0
    failed = []

    for i, c in enumerate(qs):
        print(f"{i + 1} / {total}")
        name = c.registered_name

        try:
            parts = pattern.split(name, maxsplit=1)

            if len(parts) < 2:
                raise ValueError(f"splitter matched by filter but not by regex: {name!r}")

            c.registered_name = parts[0].strip().upper()
            c.trading_name = parts[1].strip().upper()
            c.save(update_fields=["registered_name", "trading_name"])
            passed += 1

        except Exception as e:
            failed.append((c.pk, name, str(e)))

    print("\n--- Summary ---")
    print(f"Total:  {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {len(failed)}")

    if failed:
        print("\nFailed records:")
        for pk, name, err in failed:
            print(f"  id={pk} | {name!r} | {err}")

    return {"total": total, "passed": passed, "failed": failed}
"""Text summaries for FIN credit records.

These format the objects returned by :class:`apps.utils.entity_lookup.EntityLookUp`
into the ``Insolvencies, Judgements, Defaults`` text block. They are pure
functions: no database reads or writes happen here.
"""


def normalize_currency(value: str | None) -> str:
    """Map FIN's currency codes onto the currencies we display."""
    if not value:
        return "USD"
    value = str(value).strip().upper()
    if value in ("NOT GIVEN", "NOT SPECIFIED") or len(value) > 4:
        return "USD"
    if value[:2] == "ZW":
        return "ZiG"
    if value[:2] == "US":
        return "USD"
    return value


def _status(record) -> str:
    return "settled" if getattr(record, "is_closed", False) else "open"


def _date(value) -> str:
    text = str(value).strip() if value else ""
    if not text:
        return "unknown date"
    return text


def _claim_lines(claims, label: str) -> list[str]:
    lines = []
    for claim in claims:
        date = _date(getattr(claim, "date_of_claim", None))
        currency = normalize_currency(getattr(claim, "currency_type", None))
        line = f"{label} on {date}"

        creditor = getattr(claim, "company_creditor_fins__registration_name", None)
        if creditor:
            line += f" by creditor {creditor}"

        amount = getattr(claim, "amount", None)
        if amount:
            line += f" for {currency} {amount}"

        overdue = getattr(claim, "overdue_balance", None)
        if overdue:
            line += f" (Overdue: {currency} {overdue})"

        line += f" with status {_status(claim)}."
        lines.append(line)
    return lines


def _summarize_claims(claims) -> list[str]:
    return _claim_lines(claims, "Claim")


def _summarize_absconders(absconders) -> list[str]:
    return _claim_lines(absconders, "Absconder record")


def _summarize_court_judgements(records) -> list[str]:
    lines = []
    for record in records:
        court = getattr(record, "court_name", None) or "unknown court"
        date = _date(getattr(record, "judgement_date", None))
        line = f"Court judgement from {court} on {date}"

        amount = getattr(record, "amount", None)
        if amount:
            currency = normalize_currency(getattr(record, "currency_type", None))
            line += f" for {currency} {amount}"

        plaintiff = getattr(record, "plaintf_name", None)
        if plaintiff:
            line += f" by plaintiff {plaintiff}"

        line += f" with status {_status(record)}."
        lines.append(line)
    return lines


def build_insolvencies_summary(claims=None, absconders=None, court_records=None) -> str:
    """Build the ``Insolvencies, Judgements, Defaults`` text block."""
    parts: list[str] = []
    if court_records:
        parts.extend(_summarize_court_judgements(court_records))
    if absconders:
        parts.extend(_summarize_absconders(absconders))
    if claims:
        parts.extend(_summarize_claims(claims))
    return "\n".join(parts).strip()

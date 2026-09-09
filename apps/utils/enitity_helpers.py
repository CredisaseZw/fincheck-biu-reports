def _summarize_claims(claims) -> str:
    if not claims:
        return ""
    lines = []
    for c in claims:
        summary = f"Claim on {getattr(c, 'claim_date', None) or 'unknown date'}"
        if getattr(c, 'creditor_name', None):
            summary += f" by creditor {c.creditor_name}"
        if getattr(c, 'amount', None):
            summary += f" for {getattr(c, 'currency', None) or 'USD'} {c.amount}"
        if getattr(c, 'overdue_balance', None):
            summary += f" (Overdue: {getattr(c, 'currency', None) or 'USD'} {c.overdue_balance})"
        summary += f" with status {getattr(c, 'status', None) or 'open'}."
        lines.append(summary)
    return "\n".join(lines)

def _summarize_absconders(absconders) -> str:
    if not absconders:
        return ""
    lines = []
    for a in absconders:
        summary = f"Absconder record from {getattr(a, 'start_date', None) or 'unknown date'}"
        if getattr(a, 'creditor_name', None):
            summary += f" by creditor {a.creditor_name}"
        if getattr(a, 'amount', None):
            summary += f" for {getattr(a, 'currency', None) or 'USD'} {a.amount}"
        if getattr(a, 'overdue_balance', None):
            summary += f" (Overdue: {getattr(a, 'currency', None) or 'USD'} {a.overdue_balance})"
        summary += f" with status {getattr(a, 'status', None) or 'open'}."
        lines.append(summary)
    return "\n".join(lines)

def _summarize_court_judgements(judgements) -> str:
    if not judgements:
        return ""
    lines = []
    for j in judgements:
        summary = (
            f"Court judgement from {getattr(j, 'court_name', None) or 'unknown court'} "
            f"on {getattr(j, 'judgement_date', None) or 'unknown date'}"
        )
        if getattr(j, 'amount', None):
            summary += f" for {getattr(j, 'currency', None) or 'USD'} {j.amount}"
        if getattr(j, 'plaintf_name', None):
            summary += f" by plaintiff {j.plaintf_name}"
        summary += f" with status {getattr(j, 'status', None) or 'open'}."
        lines.append(summary)
    return "\n".join(lines)

def _summarize_public_info(public_info) -> str:
    if not public_info:
        return ""
    lines = []
    for p in public_info:
        record_date = getattr(p, 'record_date', None) or 'unknown date'
        summary_text = getattr(p, 'summary', None) or ''
        lines.append(f"Public info on {record_date}: {summary_text}.")
    return "\n".join(lines)

def _build_insolvencies_summary(instance) -> str:
    claims = [c for c in instance.claims.all() if getattr(c, 'status', None) == 'open']
    absconders = [a for a in instance.absconders.all() if getattr(a, 'status', None) == 'open']
    court_judgements = list(instance.court_judgements.all())
    public_info = (
        list(instance.public_information.all())
        if hasattr(instance, 'public_information')
        else []
    )

    parts = []
    if court_judgements:
        parts.append(_summarize_court_judgements(court_judgements))
    if public_info:
        parts.append(_summarize_public_info(public_info))

    absconders_summary = _summarize_absconders(absconders)
    if absconders_summary:
        parts.append(absconders_summary)

    claims_summary = _summarize_claims(claims)
    if claims_summary:
        parts.append(claims_summary)

    return "\n".join(parts).strip()

def sync_insolvencies_summary( instance):
    if not hasattr(instance, 'insolvencies_judgements'):
        return
    instance.insolvencies_judgements = _build_insolvencies_summary(instance)
    instance.save(update_fields=['insolvencies_judgements'])

from decimal import Decimal
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType
from django.db import transaction

from apps.companies.models import (
    Company,
    CompanyOverview,
    CompanyStructure,
    CompanyOperations,
)
from apps.shareholding.models import CompanyShareholding, Shareholder
from apps.directors.models import CompanyDirector
from apps.individuals.models import Individuals, EmploymentInformation, NextOfKin
from apps.common.models import (
    RegistrationAccounts,
    BankerAccounts,
    ProfessionalPartners,
    Financials,
    TradeReferences,
)
from apps.credit_records.models import InsolvencyRecord, PublicInformation
from .entity_schemas import CompanyReportSchema, IndividualReportSchema


def _dec(value) -> Decimal | None:
    """float/None -> Decimal/None. Goes through str() to avoid binary float
    imprecision (Decimal(0.1) != Decimal('0.1))."""
    if value is None:
        return None
    return Decimal(str(value))

def _save_common_subject_records(subject, data) -> None:
    content_type = ContentType.objects.get_for_model(subject)

    if data.registration_accounts:
        RegistrationAccounts.objects.update_or_create(
            subject_content_type=content_type,
            subject_object_id=subject.pk,
            defaults=data.registration_accounts.model_dump(),
        )

    for acct in data.banker_accounts:
        BankerAccounts.objects.get_or_create(
            subject_content_type=content_type,
            subject_object_id=subject.pk,
            account_number=acct.account_number,
            defaults={
                "bank": acct.bank,
                "branch": acct.branch or "",
                "account_name": acct.account_name or "",
                "account_type": acct.account_type,
                "bank_code": acct.bank_code,
                "narration": acct.narration or BankerAccounts.Narrations.A,
            },
        )

    if data.professional_partners:
        ProfessionalPartners.objects.update_or_create(
            subject_content_type=content_type,
            subject_object_id=subject.pk,
            defaults={
                "auditors": data.professional_partners.auditors or "",
                "lawyers": data.professional_partners.lawyers or "",
            },
        )

    if data.financials:
        Financials.objects.update_or_create(
            subject_content_type=content_type,
            subject_object_id=subject.pk,
            defaults={
                "net_profit": data.financials.net_profit,
                "net_worth": data.financials.net_worth,
                "total_revenue": data.financials.total_revenue,
                "financial_year": data.financials.financial_year,
                "total_assets": _dec(data.financials.total_assets),
                "asset_ratio": _dec(data.financials.asset_ratio),
            },
        )

    for ref in data.trade_references:
        TradeReferences.objects.get_or_create(
            subject_content_type=content_type,
            subject_object_id=subject.pk,
            name=ref.name,
            defaults={
                "contact_info": ref.contact_info,
                "reference_source": ref.reference_source,
                "position": ref.position,
                "credit_limit": ref.credit_limit,
                "credit_terms": ref.credit_terms,
                "payment_trend": ref.payment_trend,
            },
        )

    for rec in data.insolvency_records:
        InsolvencyRecord.objects.get_or_create(
            subject_content_type=content_type,
            subject_object_id=subject.pk,
            insolvency_type=rec.insolvency_type,
            start_date=rec.start_date,
            defaults={"end_date": rec.end_date, "court_reference": rec.court_reference},
        )

    for info in data.public_information:
        PublicInformation.objects.get_or_create(
            subject_content_type=content_type,
            subject_object_id=subject.pk,
            summary=info.summary,
            defaults={"record_date": info.record_date, "link": info.link},
        )


# Individual
@transaction.atomic
def save_individual_report(data: IndividualReportSchema) -> Individuals:
    individual, _ = Individuals.objects.update_or_create(
        national_id=data.national_id,
        defaults={
            "full_name": data.full_name,
            "date_of_birth": data.date_of_birth,
            "gender": data.gender,
            "marital_status": data.marital_status or Individuals.MaritalStatus.SINGLE,
            "nationality": data.nationality,
            "residential_address": data.residential_address,
            "address_prev": data.address_prev,
            "is_pep": data.is_pep,
            "mobile_number": data.mobile_number,
            "email": data.email,
        },
    )

    if data.employment_information:
        EmploymentInformation.objects.update_or_create(
            individual=individual,
            defaults={
                **data.employment_information.model_dump(exclude={"monthly_income"}),
                "monthly_income": _dec(data.employment_information.monthly_income),
            },
        )

    if data.next_of_kin:
        NextOfKin.objects.update_or_create(
            individual=individual,
            defaults=data.next_of_kin.model_dump(),
        )

    _save_common_subject_records(individual, data)
    return individual

# Company

def _get_or_create_director_individual(director) -> Individuals:
    individual, _ = Individuals.objects.update_or_create(
        national_id=director.national_id or f"UNKNOWN-{director.full_name}",
        defaults={
            "full_name": director.full_name,
            "gender": director.gender,
            "residential_address": director.residential_address,
            "mobile_number": "",
        },
    )
    return individual


@transaction.atomic
def save_company_report(data: CompanyReportSchema) -> Company:
    if Company.objects.filter(
        Q(registration_number = data.registration_number) |
        Q(re_registration_number = data.re_registration_number)
    ).exists(): # the company is already stored and we have current data on the subject
        return True

    company = Company.objects.create(
        **{
            "trading_name": data.trading_name,
            "registration_number": data.registration_number,
            "re_registration_number": data.re_registration_number,
            "date_of_incorporation": data.date_of_incorporation,
            "date_of_registration": data.date_of_registration,
            "location": data.location,
            "site_ownership": data.site_ownership,
            "address_registered": data.address_registered,
            "email": data.email,
            "telephone_number": data.telephone_number,
            "mobile_number": data.mobile_number,
            "website": data.website,
        }
    )

    if data.overview:
        CompanyOverview.objects.update_or_create(
            company=company, defaults=data.overview.model_dump()
        )

    if data.structure:
        CompanyStructure.objects.update_or_create(
            company=company, defaults=data.structure.model_dump()
        )

    if data.operations:
        CompanyOperations.objects.update_or_create(
            company=company, defaults=data.operations.model_dump()
        )

    if data.shareholding:
        shareholding, _ = CompanyShareholding.objects.update_or_create(
            company=company,
            defaults={
                "numbers_of_shareholders": data.shareholding.numbers_of_shareholders,
                "issued_share_capital": _dec(data.shareholding.issued_share_capital),
                "authorized_capital": _dec(data.shareholding.authorized_capital),
            },
        )
        for sh in data.shareholding.shareholders:
            Shareholder.objects.update_or_create(
                shareholding=shareholding,
                full_name=sh.full_name,
                defaults={
                    "address": sh.address or "",
                    "number_of_shares": sh.number_of_shares,
                    "percentage_ownership": _dec(sh.percentage_ownership),
                    "is_pep": sh.is_pep,
                },
            )

    for director in data.directors:
        individual = _get_or_create_director_individual(director)
        CompanyDirector.objects.update_or_create(
            company=company,
            individual=individual,
            defaults={"position": director.position},
        )

    _save_common_subject_records(company, data)
    return company
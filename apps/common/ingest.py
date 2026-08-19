import logging
from decimal import Decimal
from django.db.models import Q
from django.db import IntegrityError, transaction
from django.contrib.contenttypes.models import ContentType
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
from .report_types import CompanyReportSchema, IndividualReportSchema
from apps.utils.entity_lookup import EntityLookUp
from pprintpp import pprint

logger = logging.getLogger(__name__)
entity_lookup = EntityLookUp()

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
                "account_type": acct.account_type or "current",
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
def save_individual(data: IndividualReportSchema) -> Individuals:
    national_id = Individuals.normalize_national_id(data.national_id)
    individual = Individuals.objects.filter(
        national_id=national_id
    ).first()
    if individual: #skip creation we already have something on him
        return individual

    individual = Individuals.objects.create(
        **{
            "national_id": national_id,
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

    # SAVE CLAIMS, ABS SOMETHING AND COURT RECORDS

    payload = entity_lookup.hit_endpoint("individual", value = individual.national_id)
    try:
        if payload:
            chained_data = entity_lookup._prepare_serializer_individual_data(payload, individual.pk)
            entity_lookup.sync_individual_records(individual, chained_data)
    except Exception:
        logger.exception(
            "Entity lookup failed for individual '%s' (pk=%s) — "
            "Individual was saved but credit records were not synced",
            individual.full_name, individual.pk,
        )
        
    _save_common_subject_records(individual, data)
    return individual


# Company
def _get_or_create_director_individual(director):
    if not director.national_id:
        return None
    
    d_national_id = Individuals.normalize_national_id(director.national_id)
    individual, created = Individuals.objects.get_or_create(
        national_id= d_national_id or f"UNKNOWN-{director.full_name}",
        defaults={
            "national_id": d_national_id,
            "full_name": director.full_name,
            "gender": director.gender,
            "residential_address": director.residential_address,
        },
    )
    if created:
        try:
            payload = entity_lookup.hit_endpoint("individual", value = individual.national_id)
            if payload:
                chained_data = entity_lookup._prepare_serializer_individual_data(payload, individual.pk)
                entity_lookup.sync_individual_records(individual, chained_data)
        except Exception:
            logger.exception(
                "Entity lookup failed for individual '%s' (pk=%s) — "
                "Individual was saved but credit records were not synced",
                individual.full_name, individual.pk,
            )
               
    return individual


@transaction.atomic
def save_company(data: CompanyReportSchema) -> Company:
    existing = None
    if data.registration_number or data.re_registration_number:
        q = Q()
        if data.registration_number:
            q |= Q(registration_number=data.registration_number)
        if data.re_registration_number:
            q |= Q(re_registration_number=data.re_registration_number)
        existing = Company.objects.filter(q).first()

    if not existing and data.registered_name:
        existing = Company.objects.filter(
            Q(registered_name=data.registered_name)
            | (Q(trading_name=data.trading_name) if data.trading_name else Q())
        ).first()

    if existing:  # already stored and we have current data on the subject
        return existing

    try:
        company = Company.objects.create(
            **{
                "registered_name": data.registered_name,
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
    except IntegrityError:
        logger.warning(
            "IntegrityError creating company '%s' (trading: '%s') — "
            "falling back to lookup by name",
            data.registered_name, data.trading_name,
        )
        existing = Company.objects.filter(registered_name=data.registered_name).first()
        if existing:
            return existing
        raise 

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
        if individual:
            CompanyDirector.objects.update_or_create(
                company=company,
                individual=individual,
                defaults={"position": director.position},
            )

    # Entity lookup — wrapped so a fincheck API failure doesn't tank the save
    try:
        value = company.registration_number if company.registration_number else company.re_registration_number
        if value:
            payload = entity_lookup.hit_endpoint("company", value)
            if payload: 
                chained_data = entity_lookup._prepare_serializer_company_data(payload, company.pk)
                entity_lookup.sync_company_records(company, chained_data)
    except Exception:
        logger.exception(
            "Entity lookup failed for company '%s' (pk=%s) — "
            "company was saved but credit records were not synced",
            data.registered_name, company.pk,
        )

    _save_common_subject_records(company, data)
    return company
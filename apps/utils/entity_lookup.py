from django.db.models import Model
from django.db import IntegrityError
from apps.individuals.models import Individuals
from apps.companies.models import Company
from django.contrib.contenttypes.models import ContentType
from apps.credit_records.models import Claims, Absconders, CourtJudgement
from typing import List, Optional
from pydantic import BaseModel
from .helpers import get_content_type_id
import requests
import logging

logger = logging.getLogger(__name__)


class IndividualInterface(BaseModel):
    fins_number: str
    national_id: str
    firstname: str
    surname: str
    dob: Optional[str] = None
    gender: Optional[str] = None
    mobile: Optional[str] = None
    address: Optional[str] = None
    risk_class: Optional[str] = None

class CompanyInterface(BaseModel):
    fins_number: str
    registration_number: Optional[str] = None
    registration_name: Optional[str] = None
    trading_name: Optional[str] = None
    mobile_phone: Optional[str] = None
    email: Optional[str] = None
    current_address: Optional[str] = None
    industry: Optional[str] = None
    risk_class: Optional[str] = None
    legal_status: Optional[str] = None
    trading_status: Optional[str] = None

class Summary(BaseModel):
    claims_count: int
    court_cases_count: int

class Claim(BaseModel):
    claim_number: int
    account_number: Optional[str] = None
    amount: str
    overdue_balance: Optional[str] = None
    date_of_claim: str
    currency_type: Optional[str] = None
    is_closed: bool
    is_absconder: bool
    company_creditor_fins__registration_name: Optional[str] = None

class CourtRecord(BaseModel):
    case_number: str
    court_name: str
    amount: str
    currency_type: str
    judgement_date: str
    is_closed: bool
    plaintf_name: str

class LookupCompanyResponse(BaseModel):
    found: bool
    company: CompanyInterface
    summary: Summary
    claims: List[Claim]
    court_records: List[CourtRecord]

class LookupIndividualResponse(BaseModel):
    found: bool
    individual: IndividualInterface
    summary: Summary
    claims: List[Claim]
    court_records: List[CourtRecord]

_FIN_LINK = "https://secure-fincheckzim.com"
HEADERS = {
    "username": "assetsafe.com",
    "token": "IJl1lIASX3AQAZJbZPT",
}
LINKS = {
    "company": "/lookup-company/",
    "individual": "/lookup-person/"
}

def _handle_currency_type(value: str) -> str:
    if not value:
        return "USD"
    if value == "Not Given" or value == "Not Specified" or len(value) > 4:
        return "USD"
    if value[:2] == "ZW":
        return "ZiG"
    if value[:2] == "US":
        return "USD"
    return value.upper()

def _save_claims_absconder(claims: List[Claim], debtor_object_id: int, debtor_type: str):
    debtor_content_type = get_content_type_id(
        subject_object_id=debtor_object_id,
        subject_type=debtor_type,
        return_id=False
    )
    for claim in claims:    
        claim_data = {
            'debtor_content_type': debtor_content_type,
            'debtor_object_id': debtor_object_id,
            'subject_content_type': debtor_content_type,
            'subject_object_id': debtor_object_id,
            'amount': claim.amount,
            'status': 'settled' if claim.is_closed else 'open',
            **({'account_number': claim.account_number} if claim.account_number else {}),
            **({'creditor_name': claim.company_creditor_fins__registration_name} if claim.company_creditor_fins__registration_name else {}),
            **({'currency': _handle_currency_type(claim.currency_type.upper())} if claim.currency_type else {}),
            **({'overdue_balance': claim.overdue_balance} if claim.overdue_balance else {}),
        }
        try:
            if claim.is_absconder:
                Absconders.objects.create(
                    start_date=claim.date_of_claim,
                    **claim_data
                )
            else:
                Claims.objects.create(
                    claim_date=claim.date_of_claim,
                    **claim_data
                )
        except Exception:
            logger.exception(
                "Failed to save claim/absconder record for %s #%s",
                debtor_type, debtor_object_id
            )


def _save_court_judgement(courts: List[CourtRecord], debtor_object_id: int, debtor_type: str):
    debtor_content_type = get_content_type_id(
        subject_object_id=debtor_object_id,
        subject_type=debtor_type,
        return_id=False
    )
    
    for record in courts:
        record_data = {
            'subject_content_type': debtor_content_type,
            'subject_object_id': debtor_object_id,
            'amount': record.amount,
            'status': 'settled' if record.is_closed else 'open',
            **({'currency': _handle_currency_type(record.currency_type.upper())} if record.currency_type else {}),
            **({'case_number': record.case_number} if record.case_number else {}),
            **({'court_name': record.court_name} if record.court_name else {}),
            **({'judgement_date': record.judgement_date} if record.judgement_date else {}),
            **({'plaintf_name': record.plaintf_name} if record.plaintf_name else {}),
        }
        try:
            CourtJudgement.objects.create(**record_data)
        except Exception:
            logger.exception(
                "Failed to save court judgement for %s #%s",
                debtor_type, debtor_object_id
            )


def _get_existing_company(registered_name: Optional[str], trading_name: Optional[str],
                           registration_number: Optional[str]) -> Optional["Company"]:
    """
    Best-effort lookup of an already-existing Company after a create() collides
    on a unique field (registered_name / trading_name). Tries the most specific
    identifier first.
    """
    if registration_number:
        existing = Company.objects.filter(registration_number=registration_number).first()
        if existing:
            return existing
    if registered_name:
        existing = Company.objects.filter(registered_name=registered_name).first()
        if existing:
            return existing
    if trading_name:
        existing = Company.objects.filter(trading_name=trading_name).first()
        if existing:
            return existing
    return None


def save_company_data(response):
    data = LookupCompanyResponse.model_validate(response)
    if not data.found:
        return None

    if not data.company.registration_name:
        return None

    company_data = {
        **({'trading_name': data.company.trading_name} if data.company.trading_name else {}),
        **({'registration_number': data.company.registration_number} if data.company.registration_number else {}),
        **({'email': data.company.email} if data.company.email else {}),
        **({'mobile_number': data.company.mobile_phone} if data.company.mobile_phone else {}),
        **({'address_registered': data.company.current_address} if data.company.current_address else {}),
        'registered_name': data.company.registration_name,
    }

    try:
        company_instance = Company.objects.create(**company_data, refer_type="fp3")
    except IntegrityError:
        existing = _get_existing_company(
            registered_name=data.company.registration_name,
            trading_name=data.company.trading_name,
            registration_number=data.company.registration_number,
        )
        if existing:
            return existing
        raise

    _save_claims_absconder(
        claims=data.claims,
        debtor_object_id=company_instance.pk,
        debtor_type="company"
    )
    _save_court_judgement(
        courts=data.court_records,
        debtor_object_id=company_instance.pk,
        debtor_type="company"
    )

    company_instance.refresh_from_db()
    return company_instance


def save_individual_data(response):
    data = LookupIndividualResponse.model_validate(response)
    if not data.found:
        return None

    individual_data = {
        **({'date_of_birth': data.individual.dob} if data.individual.dob else {}),
        **({'gender': data.individual.gender} if data.individual.gender else {}),
        **({'mobile_number': data.individual.mobile} if data.individual.mobile else {}),
        **({'residential_address': data.individual.address} if data.individual.address else {}),
        'full_name': f"{data.individual.firstname} {data.individual.surname}",
        'national_id': data.individual.national_id
    }

    try:
        individual_instance = Individuals.objects.create(**individual_data, refer_type="fp3")
    except IntegrityError:
        existing = Individuals.objects.filter(national_id=data.individual.national_id).first()
        if existing:
            return existing
        raise

    _save_claims_absconder(
        claims=data.claims,
        debtor_object_id=individual_instance.pk,
        debtor_type="individual"
    )
    _save_court_judgement(
        courts=data.court_records,
        debtor_object_id=individual_instance.pk,
        debtor_type="individual"
    )

    individual_instance.refresh_from_db()
    return individual_instance


def entity_look_up(type: str, value: str) -> Optional[Model]:
    params = {"national_id": value} if type == "individual" else {"search": value}

    try:
        response = requests.get(
            f"{_FIN_LINK}{LINKS[type]}",
            headers=HEADERS,
            params=params,
            timeout=5,
        )
        response.raise_for_status()
    except requests.RequestException:
        logger.exception("FIN lookup request failed for type=%s value=%s", type, value)
        return None

    try:
        payload = response.json()
    except ValueError:
        logger.exception("FIN lookup returned non-JSON response for type=%s value=%s", type, value)
        return None

    try:
        instance = (
            save_individual_data(response=payload)
            if type == "individual"
            else save_company_data(response=payload)
        )
    except Exception:
        logger.exception("Failed to save FIN lookup result for type=%s value=%s", type, value)
        return None

    return instance
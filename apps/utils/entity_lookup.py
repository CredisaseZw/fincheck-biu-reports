from django.db import IntegrityError
from apps.individuals.models import Individuals
from apps.companies.models import Company
from django.conf import settings
from typing import List, Optional
from pydantic import BaseModel, Field, ValidationError
from django.contrib.contenttypes.models import ContentType
from apps.utils.enitity_helpers import build_insolvencies_summary, normalize_currency
import requests

import logging
logger = logging.getLogger(__name__)

class IndividualInterface(BaseModel):
    fins_number: str
    national_id: Optional[str] = None
    firstname: Optional[str] = None
    surname: Optional[str] = None
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
    amount: Optional[str] = None
    overdue_balance: Optional[str] = None
    date_of_claim: Optional[str] = None
    currency_type: Optional[str] = None
    is_closed: bool
    is_absconder: bool
    company_creditor_fins__registration_name: Optional[str] = None


class CourtRecord(BaseModel):
    case_number: Optional[str] = None
    court_name: Optional[str] = None
    amount: Optional[str] = None
    currency_type: Optional[str] = None
    judgement_date: Optional[str] = None
    is_closed: bool
    plaintf_name: Optional[str] = None


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


class EntityCreditRecords(BaseModel):
    """Credit records as returned by the FIN endpoint - never persisted."""
    claims: List[Claim] = Field(default_factory=list)
    absconders: List[Claim] = Field(default_factory=list)
    court_records: List[CourtRecord] = Field(default_factory=list)
    summary: str = ""


class EntityLookUp:
    def __init__(self):
        self._FIN_LINK = "https://secure-fincheckzim.com"
        self.HEADERS = {
            "username": settings.FINCHECK_USERNAME,
            "token": settings.FINCHECK_PASSWORD,
        }
        self.LINKS = {
            "company": "/lookup-company/",
            "individual": "/lookup-person/"
        }

    @staticmethod
    def _handle_gender(value: str) -> str:
        value = value.lower()
        if value in ["male", "m"]:
            return "male"
        if value in ["female", "f"]:
            return "female"
        return "unknown"

    @staticmethod
    def _get_existing_company(
            registered_name: Optional[str],
            trading_name: Optional[str],
            registration_number: Optional[str]) -> Optional["Company"]:
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

    @staticmethod
    def get_content_type_id(subject_object_id, subject_type: str, return_id=True) -> int | None:
        model_map = {
            "company": Company,
            "individual": Individuals,
        }

        model = model_map.get(subject_type)
        if not model:
            raise ValueError(f"Unknown subject_type: {subject_type!r}")

        subject = model.objects.filter(pk=subject_object_id).first()
        if not subject:
            raise LookupError(
                f"No {model.__name__} found with pk={subject_object_id!r} "
                f"(subject_type={subject_type!r})"
            )
        if return_id:
            return ContentType.objects.get_for_model(subject).id
        return ContentType.objects.get_for_model(subject)

    def _prepare_individual_data(self, individual: IndividualInterface) -> dict:
        return {
            **({'date_of_birth': individual.dob} if individual.dob else {}),
            **({'gender': self._handle_gender(individual.gender)} if individual.gender else {}),
            **({'mobile_number': individual.mobile} if individual.mobile else {}),
            **({'residential_address': individual.address} if individual.address else {}),
            'full_name': f"{individual.firstname} {individual.surname}",
            'national_id': Individuals.normalize_national_id(individual.national_id) if individual.national_id else None,
        }

    def _prepare_company_data(self, company: CompanyInterface) -> dict:
        return {
            **({'trading_name': company.trading_name} if company.trading_name else {}),
            **({'registration_number': company.registration_number} if company.registration_number else {}),
            **({'email': company.email} if company.email else {}),
            **({'mobile_number': company.mobile_phone} if company.mobile_phone else {}),
            **({'address_registered': company.current_address} if company.current_address else {}),
            'registered_name': company.registration_name,
        }

    def save_company_data(self, response):
        data = LookupCompanyResponse.model_validate(response)
        if not data.found:
            return None

        if not data.company.registration_name:
            return None

        company_data = self._prepare_company_data(data.company)
        try:
            company_instance = Company.objects.create(**company_data, refer_type="fp3")
        except IntegrityError:
            existing = self._get_existing_company(
                registered_name=data.company.registration_name,
                trading_name=data.company.trading_name,
                registration_number=data.company.registration_number,
            )
            if existing:
                return existing
            raise

        return company_instance

    def save_individual_data(self, response):
        data = LookupIndividualResponse.model_validate(response)
        if not data.found:
            return None

        individual_data = self._prepare_individual_data(data.individual)
        try:
            individual_instance = Individuals.objects.create(**individual_data, refer_type="fp3")
        except IntegrityError:
            existing = Individuals.objects.filter(national_id=data.individual.national_id).first()
            if existing:
                return existing
            raise

        return individual_instance

    def fetch_credit_records(self, type: str, value: Optional[str]) -> Optional[EntityCreditRecords]:
        """Hit the FIN endpoint and return its claims, absconders and court judgements.

        Returns ``None`` when the lookup fails or the entity is not found.
        Nothing is written to the database.
        """
        if not value:
            return None

        payload = self.hit_endpoint(type=type, value=value)
        if not payload:
            return None

        schema = LookupIndividualResponse if type == "individual" else LookupCompanyResponse
        try:
            data = schema.model_validate(payload)
        except ValidationError:
            logger.exception("Unexpected FIN lookup payload for type=%s value=%s", type, value)
            return None

        if not data.found:
            return None

        claims = [claim for claim in data.claims if not claim.is_absconder and not claim.is_closed]
        absconders = [claim for claim in data.claims if claim.is_absconder and not claim.is_closed]
        court_records = list(data.court_records)

        return EntityCreditRecords(
            claims=claims,
            absconders=absconders,
            court_records=court_records,
            summary=build_insolvencies_summary(claims, absconders, court_records),
        )

    def credit_records_text(self, type: str, value: Optional[str]) -> Optional[str]:
        """The ``Insolvencies, Judgements, Defaults`` text, or ``None`` if the lookup failed."""
        records = self.fetch_credit_records(type, value)
        if records is None:
            return None
        return records.summary

    def _claim_payload(self, claim: Claim, date_field: str, debtor: dict) -> dict:
        return {
            "id": claim.claim_number,
            "debtor": debtor,
            "creditor_name": claim.company_creditor_fins__registration_name,
            "currency": normalize_currency(claim.currency_type),
            "amount": claim.amount,
            "account_number": claim.account_number,
            "overdue_balance": claim.overdue_balance,
            date_field: claim.date_of_claim,
            "status": "settled" if claim.is_closed else "open",
        }

    def _court_payload(self, record: CourtRecord, record_id: int) -> dict:
        return {
            "id": record_id,
            "court_name": record.court_name,
            "case_number": record.case_number,
            "plaintf_name": record.plaintf_name,
            "currency": normalize_currency(record.currency_type),
            "amount": record.amount,
            "judgement_date": record.judgement_date,
            "status": "settled" if record.is_closed else "open",
        }

    def credit_record_payload(
        self,
        type: str,
        value: Optional[str],
        subject_object_id: Optional[int] = None,
        subject_name: Optional[str] = None,
    ) -> dict:
        """Serialized credit records plus their text summary.

        Returns an empty dict when the endpoint cannot be reached so callers can
        merge the result straight into a representation.
        """
        records = self.fetch_credit_records(type, value)
        if records is None:
            return {}

        debtor = {
            "name": subject_name,
            "extras": {
                "debtor_object_id": subject_object_id,
                "debtor_type": type,
            },
        }
        return {
            "claims": [
                self._claim_payload(claim, "claim_date", debtor)
                for claim in records.claims
            ],
            "absconders": [
                self._claim_payload(claim, "start_date", debtor)
                for claim in records.absconders
            ],
            "court_judgements": [
                self._court_payload(record, index)
                for index, record in enumerate(records.court_records, start=1)
            ],
            "insolvencies_judgements": records.summary,
        }

    def hit_endpoint(self, type: str, value: str):
        params = {"national_id": Individuals.normalize_national_id(value)} if type == "individual" else {"search": value}

        try:
            response = requests.get(
                f"{self._FIN_LINK}{self.LINKS[type]}",
                headers=self.HEADERS,
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

        return payload

    def entity_look_up(self, type: str, value: str):
        payload = self.hit_endpoint(type=type, value=value)
        try:
            instance = (
                self.save_individual_data(response=payload)
                if type == "individual"
                else self.save_company_data(response=payload)
            )
        except Exception:
            logger.exception("Failed to save FIN lookup result for type=%s value=%s", type, value)
            return None

        return instance

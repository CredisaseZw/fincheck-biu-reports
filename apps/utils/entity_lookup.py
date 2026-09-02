from django.db.models import Model
from django.db import IntegrityError
from apps.individuals.models import Individuals
from apps.companies.models import Company
from django.db import transaction
from apps.credit_records.models import Claims, Absconders, CourtJudgement
from typing import List, Optional
from pydantic import BaseModel
from django.contrib.contenttypes.models import ContentType
import requests
from apps.credit_records.serializers import (
    AbscondersSerializer,
    ClaimsSerializer,
    CourtJudgementSerializer
)
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
    date_of_claim: Optional[str]= None
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

class EntityLookUp:
    def __init__(self):
        self._FIN_LINK = "https://secure-fincheckzim.com"
        self.HEADERS = {
            "username": "assetsafe.com",
            "token": "IJl1lIASX3AQAZJbZPT",
        }
        self.LINKS = {
            "company": "/lookup-company/",
            "individual": "/lookup-person/"
        }
    
    @staticmethod
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
    def get_content_type_id(subject_object_id, subject_type: str, return_id= True) -> int | None:
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

    def _prepare_claim_data(self, claim: Claim, debtor_content_type, debtor_object_id: int) -> dict:
        date_field = 'start_date' if claim.is_absconder else 'claim_date'
        return {
            'debtor_content_type': debtor_content_type,
            'debtor_object_id': debtor_object_id,
            'subject_content_type': debtor_content_type,
            'subject_object_id': debtor_object_id,
            'amount': claim.amount,
            'status': 'settled' if claim.is_closed else 'open',
            date_field: claim.date_of_claim,
            **({'account_number': claim.account_number} if claim.account_number else {}),
            **({'creditor_name': claim.company_creditor_fins__registration_name} if claim.company_creditor_fins__registration_name else {}),
            **({'currency': self._handle_currency_type(claim.currency_type.upper())} if claim.currency_type else {}),
            **({'overdue_balance': claim.overdue_balance} if claim.overdue_balance else {}),
            '_is_absconder': claim.is_absconder,
        }

    def _prepare_court_data(self, record: CourtRecord, debtor_content_type, debtor_object_id: int) -> dict:
        return {
            'subject_content_type': debtor_content_type,
            'subject_object_id': debtor_object_id,
            'amount': record.amount,
            'status': 'settled' if record.is_closed else 'open',
            **({'currency': self._handle_currency_type(record.currency_type.upper())} if record.currency_type else {}),
            **({'case_number': record.case_number} if record.case_number else {}),
            **({'court_name': record.court_name} if record.court_name else {}),
            **({'judgement_date': record.judgement_date} if record.judgement_date else {}),
            **({'plaintf_name': record.plaintf_name} if record.plaintf_name else {}),
        }

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
    
    def _claim_key(self, d: dict) -> tuple:
        if d.get('account_number'):
            return ('acc', d['account_number'])
        return ('amt', str(d.get('amount')))

    def _court_key(self, d: dict) -> tuple:
        if d.get('case_number'):
            return ('case', d['case_number'])
        return ('amt_date', str(d.get('amount')), d.get('judgement_date'))

    def _changed_fields(self, existing: dict, incoming: dict, watch_fields: list) -> dict:
        changed = {}
        for field in watch_fields:
            if field not in incoming:
                continue
            if str(existing.get(field)) != str(incoming.get(field)):
                changed[field] = incoming[field]
        return changed

    def _sync_records(self, model, existing_serialized: list, incoming: list, key_fn, watch_fields: list):
        if not incoming:
            return

        existing_by_key = {key_fn(e): e for e in existing_serialized}

        for item in incoming:
            match = existing_by_key.get(key_fn(item))
            if match is None:
                try:
                    model.objects.create(**item)
                except Exception:
                    logger.exception("Failed to create %s", model.__name__)
                continue

            changed = self._changed_fields(match, item, watch_fields)
            if not changed:
                continue

            try:
                with transaction.atomic():
                    obj = model.objects.select_for_update().get(pk=match['id'])
                    for field, value in changed.items():
                        setattr(obj, field, value)
                    obj.save(update_fields=list(changed.keys()))
            except Exception:
                logger.exception("Failed to update %s #%s", model.__name__, match.get('id'))

    def sync_individual_records(self, instance, chained_data: Optional[dict]):
        if not chained_data:
            return

        existing_claims = ClaimsSerializer(instance.claims.all(), many=True).data
        existing_absconders = AbscondersSerializer(instance.absconders.all(), many=True).data
        existing_courts = CourtJudgementSerializer(instance.court_judgements.all(), many=True).data

        self._sync_records(Claims, existing_claims, chained_data['claims'], self._claim_key, watch_fields=['status', 'overdue_balance'])
        self._sync_records(Absconders, existing_absconders, chained_data['absconders'], self._claim_key, watch_fields=['status'])
        self._sync_records(CourtJudgement, existing_courts, chained_data['court_records'], self._court_key, watch_fields=['status'])

    def sync_company_records(self, instance, chained_data: Optional[dict]):
        if not chained_data:
            return

        existing_claims = ClaimsSerializer(instance.claims.all(), many=True).data
        existing_absconders = AbscondersSerializer(instance.absconders.all(), many=True).data
        existing_courts = CourtJudgementSerializer(instance.court_judgements.all(), many=True).data

        self._sync_records(Claims, existing_claims, chained_data['claims'], self._claim_key, watch_fields=['status', 'overdue_balance'])
        self._sync_records(Absconders, existing_absconders, chained_data['absconders'], self._claim_key, watch_fields=['status'])
        self._sync_records(CourtJudgement, existing_courts, chained_data['court_records'], self._court_key, watch_fields=['status'])

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

    def _prepare_serializer_individual_data(self, response: dict, debtor_object_id: int) -> Optional[dict]:
        data = LookupIndividualResponse.model_validate(response)
        if not data.found:
            return None

        debtor_content_type = self.get_content_type_id(
            subject_object_id=debtor_object_id,
            subject_type="individual",
            return_id=False,
        )

        claims_data, absconders_data = [], []
        for claim in data.claims:
            if claim.is_closed:
                continue
            prepared = self._prepare_claim_data(claim, debtor_content_type, debtor_object_id)
            is_absconder = prepared.pop('_is_absconder')
            (absconders_data if is_absconder else claims_data).append(prepared)

        court_data = [
            self._prepare_court_data(r, debtor_content_type, debtor_object_id)
            for r in data.court_records
        ]

        return {
            'claims': claims_data,
            'absconders': absconders_data,
            'court_records': court_data,
        }

    def _prepare_serializer_company_data(self, response: dict, debtor_object_id: int) -> Optional[dict]:
        data = LookupCompanyResponse.model_validate(response)
        if not data.found or not data.company.registration_name:
            return None

        debtor_content_type = self.get_content_type_id(
            subject_object_id=debtor_object_id,
            subject_type="company",
            return_id=False,
        )

        claims_data, absconders_data = [], []
        for claim in data.claims:
            prepared = self._prepare_claim_data(claim, debtor_content_type, debtor_object_id)
            is_absconder = prepared.pop('_is_absconder')
            (absconders_data if is_absconder else claims_data).append(prepared)

        court_data = [
            self._prepare_court_data(r, debtor_content_type, debtor_object_id)
            for r in data.court_records
        ]

        return {
            'claims': claims_data,
            'absconders': absconders_data,
            'court_records': court_data,
        }
    
    def hit_endpoint(self, type:str, value: str):
        params = {"national_id": Individuals.normalize_national_id(value)} if type == "individual" else {"search": value}

        try:
            response = requests.get(
                f"{self._FIN_LINK}{self.LINKS[type]}",
                headers= self.HEADERS,
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

    def entity_look_up(self, type: str, value: str) -> Optional[Model]:
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
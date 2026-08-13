
from __future__ import annotations
from datetime import date
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from pydantic import field_validator

# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"


class MaritalStatus(str, Enum):
    SINGLE = "single"
    MARRIED = "married"
    DIVORCED = "divorced"
    WIDOWED = "widowed"


class LegalForm(str, Enum):
    PVT_LTD = "pvt_ltd"
    PLC = "plc"
    PBC = "pbc"
    PARTNERSHIP = "partnership"
    TRUST = "trust"
    JOINT_VENTURE = "joint_venture"
    COOPERATIVE = "cooperative"
    SOLE_TRADER = "sole_trader"


class TradingStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ADMINISTRATION = "administration"
    INSOLVENT = "insolvent"


class PaymentTerms(str, Enum):
    CASH_ONLY = "cash_only"
    CASH_AND_CREDIT = "cash_and_credit"
    CREDIT_ONLY = "credit_only"


class SupplierScope(str, Enum):
    LOCAL = "local"
    INTERNATIONAL = "international"
    BOTH = "local_and_international"


class AccountType(str, Enum):
    CURRENT = "current"
    SAVINGS = "savings"
    LOAN = "loan"
    FIXED_DEPOSIT = "fixed_deposit"


class BankNarration(str, Enum):
    A = "A"  # Very Good Credit Worthiness (Lowest Risk)
    B = "B"  # Good Credit Worthiness (Low Risk)
    C = "C"  # Satisfactory Credit Worthiness (Moderate Risk)
    D = "D"  # No Credit Worthy
    E = "E"  # Rating Suspended


class Currency(str, Enum):
    USD = "USD"
    ZIG = "ZiG"
    AUD = "AUD"
    CAD = "CAD"
    CHF = "CHF"
    ZAR = "ZAR"


class PaymentTrend(str, Enum):
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class InsolvencyType(str, Enum):
    INSOLVENT = "insolvent"
    JUDICIAL_MANAGEMENT = "judicial_management"


class DirectorPosition(str, Enum):
    DIRECTOR = "director"
    SECRETARY = "secretary"
    CHAIRMAN = "chairman"
    OTHER = "other"


class CompanyLocation(str, Enum):
    CITY_CENTRE = "city_centre"
    INDUSTRIAL = "industrial"
    SUBURBAN = "suburban"
    RURAL_BASED = "rural"


class SiteOwnership(str, Enum):
    OWNERS = "owners"
    RENTED = "rented"


# ---------------------------------------------------------------------------
# Shared blocks
# ---------------------------------------------------------------------------


class RegistrationAccountsSchema(BaseModel):
    tin_number: Optional[str] = None
    vat_number: Optional[str] = None
    nssa_number: Optional[str] = None
    praz_number: Optional[str] = None


class BankerAccountSchema(BaseModel):
    bank: str
    branch: Optional[str] = None
    account_name: Optional[str] = None
    account_type: Optional[AccountType] = None
    account_number: Optional[str] = None
    currency: Optional[Currency] = Field(
        None, description="Currency the account is denominated in, if stated."
    )
    bank_code: Optional[str] = None
    narration: Optional[BankNarration] = None


class ProfessionalPartnersSchema(BaseModel):
    auditors: Optional[str] = None
    lawyers: Optional[str] = None


class FinancialsSchema(BaseModel):
    """Values only. Do NOT reference/attach any file here."""

    total_assets: Optional[float] = None
    net_profit: Optional[str] = None
    net_worth: Optional[str] = None
    total_revenue: Optional[str] = None
    asset_ratio: Optional[float] = None
    financial_year: Optional[int] = None


class TradeReferenceSchema(BaseModel):
    name: str
    contact_info: Optional[str] = None
    reference_source: Optional[str] = None
    position: Optional[str] = None
    credit_limit: Optional[str] = None
    credit_terms: Optional[str] = None
    payment_trend: Optional[PaymentTrend] = None


class InsolvencyRecordSchema(BaseModel):
    """Only include an entry if a real insolvency / judicial management
    record is named. 'CLEAR TO DATE...' / NIL -> do not add an entry."""

    insolvency_type: InsolvencyType
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    court_reference: Optional[str] = None


class PublicInformationSchema(BaseModel):
    """Only include an entry if a real public record is named.
    'CLEAR TO DATE...' / NIL -> do not add an entry."""

    record_date: Optional[date] = None
    summary: Optional[str] = None
    link: Optional[str] = None


# ---------------------------------------------------------------------------
# Individual entity
# ---------------------------------------------------------------------------


class EmploymentInfoSchema(BaseModel):
    employer: Optional[str] = None
    position: Optional[str] = None
    employment_status: Optional[str] = None
    years_employed: Optional[int] = None
    monthly_income: Optional[float] = None
    previous_employer: Optional[str] = None


class NextOfKinSchema(BaseModel):
    name: str
    relationship: str
    contact_number: str


class IndividualReportSchema(BaseModel):
    """Extraction target for an INDIVIDUAL business information report."""

    full_name: str
    national_id: str
    date_of_birth: Optional[date] = None
    gender: Gender = Field(
        description=(
            "State explicitly if given. If not stated (e.g. only a name "
            "appears, such as for a director), infer from the first name."
        )
    )
    marital_status: Optional[MaritalStatus] = None
    nationality: Optional[str] = None
    residential_address: Optional[str] = None
    address_prev: Optional[str] = Field(
        None, description="Former / previous residential address."
    )
    mobile_number: str
    email: Optional[str] = None
    is_pep: bool = False

    employment_information: Optional[EmploymentInfoSchema] = None
    former_employment_information: Optional[EmploymentInfoSchema] = None
    next_of_kin: Optional[NextOfKinSchema] = None

    registration_accounts: Optional[RegistrationAccountsSchema] = None
    banker_accounts: list[BankerAccountSchema] = Field(default_factory=list)
    professional_partners: Optional[ProfessionalPartnersSchema] = None
    financials: Optional[FinancialsSchema] = None
    trade_references: list[TradeReferenceSchema] = Field(default_factory=list)

    insolvency_records: list[InsolvencyRecordSchema] = Field(default_factory=list)
    public_information: list[PublicInformationSchema] = Field(default_factory=list)

    @field_validator(
        "employment_information", "former_employment_information", "next_of_kin",
        mode="before",
    )

    @classmethod
    def unwrap_single_item_list(cls, v):
        if isinstance(v, list):
            return v[0] if v else None
        return v
# ---------------------------------------------------------------------------
# Company entity
# ---------------------------------------------------------------------------


class CompanyOverviewSchema(BaseModel):
    trading_status: Optional[TradingStatus] = None
    legal_form: Optional[LegalForm] = None
    number_of_employees: Optional[int] = None


class CompanyStructureSchema(BaseModel):
    holding_company: Optional[str] = None
    subsidiaries: Optional[str] = None
    associated_companies: Optional[str] = None
    divisions: Optional[str] = None
    branches: Optional[str] = None


class CompanyOperationsSchema(BaseModel):
    industry: Optional[str] = None
    target_markets: Optional[str] = None
    operations_territories: Optional[str] = None
    property_ownership: Optional[str] = None
    operational_areas: Optional[str] = None
    import_export: Optional[str] = None
    purchases_payment_terms: Optional[PaymentTerms] = None
    sales_payment_terms: Optional[PaymentTerms] = None
    purchase_supplier_scope: Optional[SupplierScope] = None


class ShareholderSchema(BaseModel):
    full_name: str
    address: Optional[str] = None
    number_of_shares: Optional[int] = None
    percentage_ownership: Optional[float] = None
    is_pep: bool = False


class CompanyShareholdingSchema(BaseModel):
    issued_share_capital: Optional[float] = None
    numbers_of_shareholders: int
    authorized_capital: Optional[float] = None
    shareholders: list[ShareholderSchema] = Field(default_factory=list)


class CompanyDirectorSchema(BaseModel):
    """Maps to CompanyDirector + a linked Individuals record."""

    full_name: str
    national_id: Optional[str] = None
    residential_address: Optional[str] = None
    gender: Gender = Field(
        description=(
            "Directors are usually listed as just a name + ID + address, "
            "with no explicit gender. Infer it from the first name."
        )
    )
    position: DirectorPosition = DirectorPosition.DIRECTOR


class CompanyReportSchema(BaseModel):
    """Extraction target for a COMPANY / business information report."""

    registered_name: str
    trading_name: Optional[str] = None
    registration_number: Optional[str] = None
    re_registration_number: Optional[str] = None
    date_of_incorporation: Optional[date] = None
    date_of_registration: Optional[date] = None
    location: Optional[CompanyLocation] = None
    site_ownership: Optional[SiteOwnership] = None
    address_registered: Optional[str] = None
    email: Optional[str] = None
    telephone_number: Optional[str] = None
    mobile_number: Optional[str] = None
    website: Optional[str] = None

    overview: Optional[CompanyOverviewSchema] = None
    structure: Optional[CompanyStructureSchema] = None
    operations: Optional[CompanyOperationsSchema] = None
    shareholding: Optional[CompanyShareholdingSchema] = None
    directors: list[CompanyDirectorSchema] = Field(default_factory=list)

    registration_accounts: Optional[RegistrationAccountsSchema] = None
    banker_accounts: list[BankerAccountSchema] = Field(default_factory=list)
    professional_partners: Optional[ProfessionalPartnersSchema] = None
    financials: Optional[FinancialsSchema] = None
    trade_references: list[TradeReferenceSchema] = Field(default_factory=list)

    insolvency_records: list[InsolvencyRecordSchema] = Field(default_factory=list)
    public_information: list[PublicInformationSchema] = Field(default_factory=list)

class ReportType(str, Enum):
    INDIVIDUAL = "individual"
    COMPANY = "company"

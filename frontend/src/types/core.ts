import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

export interface RouteItem  {
    name: string;
    link: string;
    icon?: LucideIcon;
    component?: ComponentType<any>;
    children?: RouteItem[]
};

export interface Header {
  name: string,
  className?: string,
  colSpan?: number
  textAlign?: "center" | "left" | "end"
}

export interface PaginationData {
  count :number,
  prev?: string,
  next?: string
}

export interface DRFResponse<T> extends PaginationData{
  results: T[];
}

interface Timestamps {
  created_at: string;
  updated_at: string;
}

export interface MiniCompany {
  id: number;
  type: "company";
  registered_name: string;
  trading_name: string | null;
  address_registered: string;
  email: string | null;
}

export interface MiniIndividual {
  id: number;
  type: "individual";
  full_name: string;
  national_id: string;
  residential_address: string;
  mobile_number: string;
  email: string | null;
}
export interface ListReport {
  id: number;
  enquiry_reference: string;
  client: MiniCompany | MiniIndividual;
  subject: MiniCompany | MiniIndividual;
  created_at: string;
  updated_at: string;
}

export interface User {
  full_name: string;
  email: string;
  is_active: boolean;
}
export interface SignInResponse extends User {
  tokens : {
      access: string,
      refresh: string
  }
}
export type EntityValue = "company" | "individual"
export type EntityMode = "client" | "subject"
export interface CompanyOverview {
  id: number;
  trading_status: "active" | "inactive" | "suspended";
  date_of_registration: string;
  legal_form: "llc" | "plc" | "sole_trader" | "partnership";
  condition: "good" | "fair" | "poor";
  trend: "improving" | "stable" | "declining";
  number_of_employees: number;
  last_financial_result: string;
  net_asset_value: string;
  authorized_share_capital: string;
  issued_share_capital: string;
}

export interface CompanyStructure {
  holding_company: string;
  subsidiaries: string;
  associated_companies: string;
  divisions: string;
  branches: string;
}

export interface CompanyOperations {
  id: number;
  industry: string;
  target_markets: string;
  operations_territories: string;
  property_ownership: string;
  operational_areas: string;
}

export interface Director {
  id: number;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
  position: "director" | "secretary" | "other";
  date_of_birth: string;
  national_id: string;
  email: string | null;
  mobile_number: string | null;
  address_latest: string | null;
  address_previous: string | null;
}

export interface Shareholding {
  id: number;
  numbers_of_shares: number;
  numbers_of_shareholders: number;
  shareholders: Shareholder[];
}

export interface Shareholder {
  id: number;
  name: string;
  address: string;
  number_of_shares: number;
  percentage: string;
}

export interface RegistrationAccount {
  id: number;
  tin_number: string | null;
  vat_number: string | null;
  nssa_number: string | null;
  praz_number: string | null;
  is_tin_verified: boolean;
  is_vat_verified: boolean;
  is_nssa_verified: boolean;
  is_praz_verified: boolean;
}

export interface BankerAccount {
  id: number;
  bank: string;
  branch: string;
  account_name: string;
  account_type: "current" | "savings" | "loan" | "fixed_deposit";
  account_number: string;
}

export interface ProfessionalPartner {
  id: number;
  auditors: string;
  lawyers: string;
}

export interface Financial {
  id: number;
  total_assets: string | null;
  net_profit: string | null;
  net_worth: string | null;
  total_revenue: string | null;
  paid_up_capital: string | null;
  authorized_capital: string | null;
  profit_and_loss: string | null;
  statement_of_financial_position: string | null;
  financial_year: number | null;
}

// Subject (Individual)
export interface EmploymentInformation {
  id: number;
  employer: string | null;
  position: string | null;
  employment_status: string | null;
  years_employed: number | null;
  monthly_income: string | null;
  previous_employer: string | null;
}

export interface NextOfKin {
  id: number;
  name?: string;
  relationship?: string;
  contact_number?: string;
}
export interface Claim {
  id: number;
  creditor_name: string;
  currency: string;
  amount: string;
  claim_date: string;
  status: "open" | "settled";
  debtor: DebtorMini | null;
}

export interface Absconder {
  id: number;
  creditor_name: string;
  currency: string;
  amount: string;
  start_date: string;
  status: string;
  debtor: DebtorMini | null;
}

export interface CourtJudgement {
  id: number;
  court_name: string;
  case_number: string;
  judgement_date: string;
  amount: string;
}

export interface InsolvencyRecord {
  id: number;
  creditor_name: string;
  currency: string;
  amount: string;
  insolvency_type: string;
  filing_date: string;
  debtor: DebtorMini | null;
}

export interface PublicInformation {
  id: number;
  summary: string;
  link: string | null;
}

type DebtorMini = MiniCompany | MiniIndividual;
export interface TradeReference {
  id: number;
  referenced_date: string;
  name: string;
  contact_info: string | null;
  reference_source: string | null;
  position: string | null;
  credit_limit: string | null;
  credit_terms: string | null;
  payment_trend: "good" | "fair" | "poor" | null;
}

export interface ReportSummary {
  id: number;
  overall_risk_rating: string | null;
  summary: string | null;
}

export interface Company extends Timestamps {
  id: number;
  company_name: string;
  registered_name: string;
  trading_name: string | null;
  refer_type: string;
  address_registered: string;
  address_operations: string;
  email: string | null;
  telephone_number: string | null;
  mobile_number: string | null;
  website: string | null;
  is_address_registered_verified: boolean;
  is_verified: boolean;
  is_active: boolean;
  is_deleted: boolean;
  overview: CompanyOverview | null;
  structure: CompanyStructure | null;
  operations: CompanyOperations | null;
  directors: Director[];
  shareholdings: Shareholding | null;
  registration_accounts: RegistrationAccount[];
  banker_accounts: BankerAccount[];
  professional_partners: ProfessionalPartner[];
  financials: Financial[];
}

export interface Individual extends Timestamps {
  id: number;
  full_name: string;
  national_id: string;
  date_of_birth: string;
  gender: string;
  marital_status: "single" | "married" | "divorced" | "widowed";
  nationality: string;
  residential_address: string;
  mobile_number: string;
  email: string | null;
  status: string | null;
  refer_type: string;
  employment_information: EmploymentInformation | null;
  next_of_kin: NextOfKin | null;
  registration_accounts: RegistrationAccount[];
  banker_accounts: BankerAccount[];
  professional_partners: ProfessionalPartner[];
  financials: Financial[];
}

export interface Report extends Timestamps {
  id: number;
  enquiry_reference: string;
  client: Company | Individual;
  subject: Individual | Company;
  client_type : EntityValue;
  subject_type: EntityValue
  references: TradeReference[];
  report_summary: ReportSummary | null;
  claims?: Claim[];
  absconders?: Absconder[];
  court_judgements?: CourtJudgement[];
  insolvency_records?: InsolvencyRecord[];
  public_information?: PublicInformation[];
}
export interface Address {
  street_address: string ;
  line_2?: string | undefined;
  country: string;
  province: string;
  city: string;
  postal_code?: string | undefined;
};

export interface DefaultHeaderProps{
  client_default_search : string,
  subject_default_search : string,
  enquiry_reference : string,
  created_at : string
}

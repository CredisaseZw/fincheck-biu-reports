import type { AbsconderFormData } from "@/hooks/useAbsconderDetails";
import type { ClaimFormData } from "@/hooks/useClaims";
import type { CourtJudgementFormData } from "@/hooks/useCourtDetails";
import type { InsolvencyRecordFormData } from "@/hooks/useInsolvencyRecordsDetails";
import type { PublicInformationFormData } from "@/hooks/usePublicInformation";
import type { FinancialEntryFormData } from "@/hooks/useFinancialsDetails";
import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import type { ProfessionalsFormData } from "@/hooks/useProfessionalPartners";
import type { RegistrationAccountsFormData } from "@/hooks/useRegistrationAccounts";
import type { TradeReferenceFormData } from "@/hooks/useTradeRefences";
import type { BankerAccountFormData } from "@/hooks/useBankersDetails";
import type { CompanyStructureFormData } from "@/hooks/useCompanyStructure";
import type { CompanyOperationsFormData } from "@/hooks/useCompanyOperations";
import type { ShareholdingsFormData } from "@/hooks/useShareholdingDetails";
import type { DirectorFormData } from "@/hooks/useDirectors"
import type { ReportDetailsFormData } from "@/hooks/useReportDetails";
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
  registration_number : string | null;
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
interface Extras {
  debtor_object_id : number,
  debtor_type : EntityValue      
}
export interface MiniDebtor  {
  extras : Extras,
  name :string
}

export interface ListReport {
  id: number;
  enquiry_reference: string;
  client: MiniCompany | MiniIndividual;
  subject: MiniCompany | MiniIndividual;
  subject_type : EntityValue,
  client_type :EntityValue
  status : "draft" | "finalized" | "in_progress" | "suspended"
  overall_risk_rating : number | null,
  username : string | null,
  report_pdf : string | null,
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
export type Currencies = "USD" | "ZiG" | "AUD" | "CAD" | "CHF" | "ZAR" 
export type EntityValue = "company" | "individual"
export type EntityMode = "client" | "subject"
type CreditRecordStatus = "open" | "settled" | "disputed" | "written_off"
export interface CompanyOverview {
  id: number;
  trading_status: "active" | "inactive" | "suspended";
  date_of_registration: string;
  legal_form: "pvt_ltd" 
  | "plc" 
  | "pbc" 
  | "partnership" 
  | "trust" 
  | "joint_venture" 
  | "cooperative" 
  | "sole_trader";
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
  import_export: string;
  purchase_supplier_scope : "local" | "local_&_international" | "international";
  sales_payment_terms: "cash_only" | "cash_and_credit" | "credit_only";
  purchases_payment_terms: "cash_only" | "cash_and_credit" | "credit_only";
}

export interface  CompanyDirector {
  id: number;
  full_name: string;
  position: "director" | "secretary" | "other";
  gender: "male" | "female";
  national_id: string;
  insolvencies_judgements: string | null;
  dob: string;
  address_latest: string;
  address_prev: string | null;
  email: string | null;
  mobile_phone_number: string | null;
  created_at: string;
  updated_at: string;
}


export interface Shareholding {
  id: number;
  numbers_of_shares: number;
  numbers_of_shareholders: number;
  shareholders: Shareholder[];
  created_at: string;
  updated_at: string;
}

export interface Shareholder {
  id: number;
  full_name: string;
  address: string;
  number_of_shares: number;
  percentage_ownership: string;
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
  account_currency : Currencies
  account_type: "current" | "savings" | "loan" | "fixed_deposit";
  account_number: string;
  date_of_acquirement : string,
  bank_code : string
  narration : "A" | "B" | "C" | "D" | "E"
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
  financials_file : string | null
  financial_year: number;
}

// Subject (Individual)
export interface EmploymentInformation {
  id: number;
  employer: string | null;
  position: string | null;
  employment_status: "employed" | "self_employed" | "unemployed" | "part_time" | "retired" | "student";
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
  currency: Currencies;
  amount: string;
  claim_date: string;
  status: CreditRecordStatus;
  debtor : MiniDebtor
}

export interface Absconder {
  id: number;
  creditor_name: string;
  currency: Currencies;
  amount: string;
  start_date: string;
  status: CreditRecordStatus;
  debtor : MiniDebtor
}

export interface CourtJudgement {
  id: number;
  court_name: string;
  case_number: string;
  currency: Currencies;
  judgement_date: string;
  amount: string;
}

export interface InsolvencyRecord {
  id: number;
  start_date : string,
  end_date:string,
  court_reference: string;
  insolvency_type: "insolvency" | "bankruptcy" | "judicial_management";
}

export interface PublicInformation {
  id: number;
  summary: string;
  record_date: string
  link: string | null;
}

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

export interface CommonFields extends Timestamps{
  id: number;
  email: string | null;
  claims: Claim[];
  absconders: Absconder[];
  court_judgements: CourtJudgement[];
  insolvency_records: InsolvencyRecord[];
  public_information: PublicInformation[];
  banker_accounts: BankerAccount[];
  trade_references : TradeReference[];
  registration_accounts: RegistrationAccount;
  professional_partners: ProfessionalPartner;
  financials: Financial;
}

export interface Company extends CommonFields{
  company_name: string;
  registration_number: string| null;
  registered_name: string;
  trading_name: string | null;
  refer_type: string;
  address_registered: string;
  address_operations: string;
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
  directors: CompanyDirector[];
  shareholdings: Shareholding | null;
}

export interface Individual extends CommonFields {
  full_name: string;
  national_id: string;
  date_of_birth: string;
  gender: string;
  marital_status: "single" | "married" | "divorced" | "widowed";
  nationality: string;
  residential_address: string;
  mobile_number: string;
  status: string | null;
  refer_type: string;
  employment_information: EmploymentInformation | null;
  next_of_kin: NextOfKin | null;
}

export interface Report extends Timestamps {
  id: number;
  enquiry_reference: string;
  client: Company | Individual;
  subject: Individual | Company;
  client_type : EntityValue;
  subject_type: EntityValue
  overall_risk_rating : number | null,
  summary : string | null
  status : "draft" | "finalized"
  references: TradeReference[];
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
interface ReportEntityProps {
  subject_object_id?: number | null
  subject_type?: EntityValue | null
  report_id : number | undefined
}

export interface AbsconderProps extends ReportEntityProps{
  absconders_data: AbsconderFormData[]
}
export interface ClaimsProps extends ReportEntityProps{
  claims_data: ClaimFormData[]
}
export interface CourtJudgementsProps extends ReportEntityProps{
  court_judgements_data: CourtJudgementFormData[]
}
export interface InsolvencyRecordsProps extends ReportEntityProps{
  insolvency_data : InsolvencyRecordFormData[]
}
export interface PublicInformationProps extends ReportEntityProps{
  public_information_data: PublicInformationFormData[]
}
export interface FinancialsProps extends ReportEntityProps{
  financials_data?: FinancialEntryFormData
}
export interface ProfessionalsProps extends ReportEntityProps{
  professionals_data: ProfessionalsFormData | undefined
}
export interface RegistrationsAccountsProps extends ReportEntityProps{
  accounts_data : RegistrationAccountsFormData | undefined
}
export interface TradeReferencesProps extends ReportEntityProps{
  trade_references_data: TradeReferenceFormData[] 
}
export interface BankerDetailsProps extends ReportEntityProps{
  banker_accounts : BankerAccountFormData[]
}
export interface CompanyStructureProps extends ReportEntityProps{
  structure_data : CompanyStructureFormData | undefined
}
export interface CompanyOperationsProps extends ReportEntityProps{
  operations_data : CompanyOperationsFormData | undefined
}
export interface CompanyShareholdingProps extends ReportEntityProps{
  shareholdings_data : ShareholdingsFormData | undefined
}
export interface CompanyDirectorsProps extends ReportEntityProps{
  directors_data : DirectorFormData[]  
}
export interface ReportDetailsProps extends ReportEntityProps{
  report_data : ReportDetailsFormData | undefined
}
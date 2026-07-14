import { useEffect, useState} from "react";
import useGetSingleReport from "./api/useGetSingleReport";
import { DEFAULT_ADDRESSES } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";
import { useReport } from "@/contexts/ReportMutationContext";
import useCreateReport from "./api/useCreateReport";
import { formatAddressToObject, getEntityID, getEntityName, handleAxiosError } from "@/lib/utils";
import type { Company, DefaultHeaderProps, EntityMode, EntityValue, Individual, ListReport, onSelectEntityProps, Report} from "@/types/core";
import type { CompanyFormData } from "./useCompanyDetails";
import type { IndividualFormData } from "./useIndividualDetails";
import type { EmploymentFormData } from "./useEmploymentInformation";
import type { NextOfKinFormData } from "./useNextOfKin";
import type { ClaimFormData } from "./useClaims";
import type { AbsconderFormData } from "./useAbsconderDetails";
import type { CourtJudgementFormData } from "./useCourtDetails";
import type { InsolvencyRecordFormData } from "./useInsolvencyRecordsDetails";
import type { PublicInformationFormData } from "./usePublicInformation";
import type { FinancialEntryFormData } from "./useFinancialsDetails";
import type { ProfessionalsFormData } from "./useProfessionalPartners";
import type { RegistrationAccountsFormData } from "./useRegistrationAccounts";
import type { TradeReferenceFormData } from "./useTradeRefences";
import type { BankerAccountFormData } from "./useBankersDetails";
import type { CompanyStructureFormData } from "./useCompanyStructure";
import type { CompanyOperationsFormData } from "./useCompanyOperations";
import type { ShareholdingsFormData } from "./useShareholdingDetails";
import type { DirectorFormData } from "./useDirectors";
import type { ReportDetailsFormData } from "./useReportDetails";
import useLockManagement from "./useLockManagement";
import type { CompanyOverviewFormData } from "./useCompanyOverview";
import { isAxiosError } from "axios";

function useAddReportDialogue(list_report?: ListReport) {
  const { mutate } = useCreateReport();
  const { setReportLoading } = useReport()
  const [open, setOpen] = useState(false);  
  const [openMisMatchDialog, setOpenMisMatchDialog] = useState(false)
  const [subjectUniqueID, setSubjectUniqueID] = useState<string | undefined | null>(undefined)
  const [clientObjectId, setClientObjectId] = useState<number | null>(null);
  const [subjectObjectId, setSubjectObjectId] = useState<number | null>(null);
  const [clientType, setClientType] = useState<EntityValue>("company")
  const [subjectType, setSubjectType] = useState<EntityValue>("company")
  const [username, setUsername] = useState<string>("");
  const [report, setReport] =useState<Report | undefined>(undefined)
  const [headerEditMode, setHeaderEditMode ] = useState<boolean>()
  const [defaultHeader, setDefaultHeader] = useState<DefaultHeaderProps | undefined>(undefined);
  const [companyInformation, setCompanyInformation] = useState<CompanyFormData | undefined>(undefined);
  const [individualDetails, setIndividualDetails] = useState<IndividualFormData | undefined>(undefined)
  const [employmentInformation, setEmploymentInformation] = useState<EmploymentFormData | undefined>(undefined);
  const [nextOfKin, setNextOfKin] = useState<NextOfKinFormData | undefined>(undefined);
  const [claims, setClaims] = useState<ClaimFormData[]>([])
  const [absconders, setAbsconders] = useState<AbsconderFormData[]>([])
  const [courtJudgements, setCourtJudgements] = useState<CourtJudgementFormData[]>([])
  const [insolvencyRecords, setInsolvencyRecords] = useState<InsolvencyRecordFormData[]>([])
  const [publicInformation, setPublicInformation] = useState<PublicInformationFormData[]>([])
  const [financials, setFinancials] = useState<FinancialEntryFormData | undefined>(undefined)
  const [professionals, setProfessionals] = useState<ProfessionalsFormData | undefined>(undefined)
  const [accounts, setAccounts] = useState<RegistrationAccountsFormData | undefined>(undefined)
  const [tradeReferences, setTradeReferences] = useState<TradeReferenceFormData[]>([])
  const [bankerDetails, setBankerDetails] = useState<BankerAccountFormData[]>([])
  const [companyOverview, setCompanyOverview] = useState<CompanyOverviewFormData | undefined>(undefined);
  const [companyStructure, setCompanyStructure] = useState<CompanyStructureFormData | undefined>(undefined);
  const [companyOperations, setCompanyOperations] = useState<CompanyOperationsFormData | undefined>(undefined)
  const [shareholding, setShareholding] = useState<ShareholdingsFormData | undefined>();
  const [directors, setDirectors] = useState<DirectorFormData[]>([])
  const [reportDetails, setReportDetails] = useState<ReportDetailsFormData | undefined>(undefined);

  const {data, isLoading, error } = useGetSingleReport({
    id : list_report?.id,
    subject_type :list_report?.subject_type,
    enabled :Boolean(list_report && open)
  });

  const {isLocked} = useLockManagement(
    report?.id, 
    Boolean( open && !headerEditMode && report )
  )
  
  const onEdit = () => setHeaderEditMode(true)
  const queryClient =  useQueryClient()

  const onUpdateEntityTypes = ( entity :EntityMode, value: EntityValue)=>{
    if (entity === "client") {
      setClientType(value);
      return;
    }
    setSubjectType(value);
  }

  const onSelectEntity = (entity : EntityMode, { id, uniqueID }: onSelectEntityProps ) => {
    if (entity === "client"){
      setClientObjectId(id)
      return;
    }
    setSubjectObjectId(id)
    setSubjectUniqueID(uniqueID)
  }

  const onSetEntityId = (entity : EntityMode, value: number | null) => {
    if (entity === "client"){
      setClientObjectId(value)
      return;
    }
    setSubjectObjectId(value)
  }


  useEffect(() => {
    if (!open) return;

    setHeaderEditMode(!list_report);
  }, [open, list_report]);

  useEffect(()=>{
    if (!open) return;
    if(handleAxiosError(error)) return 
    if(!data) return;

    setReport(data)
  },[error, data, open])

  useEffect(()=>{ // THIS EFFECT HANDLES DATA DIS ON EDIT MODE
    if(!report) return;

    setDefaultHeader({
      client_default_search : getEntityName(report.client),
      subject_default_search : getEntityName(report.subject),
      subject_unique_id : getEntityID(report.subject),
      client_unique_id : getEntityID(report.client),
      enquiry_reference : report.enquiry_reference,
      created_at : report.created_at
    })

    if(report.subject_type === "company"){
      const company = report.subject as Company
      setCompanyInformation({
        id: company.id,
        registration_number: company?.registration_number ?? "",
        registered_name: company?.registered_name ?? "",
        trading_name: company?.trading_name ?? "",
        date_of_registration: company?.date_of_registration ?? "",
        address_registered: company?.address_registered 
        ? formatAddressToObject(company.address_registered)
        : DEFAULT_ADDRESSES,
        address_operations: company?.address_operations 
        ? formatAddressToObject(company.address_operations)
        : undefined,
        email: company?.email ?? "",
        telephone_number: company?.telephone_number ?? "",
        mobile_number: company?.mobile_number ?? "",
        website: company?.website ?? "",
        is_address_registered_verified: company?.is_address_registered_verified ?? true, 
      })
      setCompanyOverview({
        trading_status: company?.overview?.trading_status ?? "active",
        legal_form: company?.overview?.legal_form ?? undefined,
        condition: company?.overview?.condition ?? "good",
        trend: company?.overview?.trend ?? "stable",
        number_of_employees: company?.overview?.number_of_employees ?? undefined,
        last_financial_result: company?.overview?.last_financial_result ?? undefined,
        net_asset_value: company?.overview?.net_asset_value ?? undefined,
        authorized_share_capital: company?.overview?.authorized_share_capital ?? undefined,
        issued_share_capital: company?.overview?.issued_share_capital ?? undefined,
      })
      setCompanyStructure({
        holding_company : company.structure?.holding_company,
        subsidiaries : company.structure?.subsidiaries,
        associated_companies : company.structure?.associated_companies,
        divisions : company.structure?.divisions,
        branches : company.structure?.branches 
      })
      setCompanyOperations({
        purchases_payment_terms : company.operations?.purchases_payment_terms,
        sales_payment_terms : company.operations?.sales_payment_terms,
        purchase_supplier_scope : company.operations?.purchase_supplier_scope,  
        import_export : company.operations?.import_export,
        industry : company.operations?.industry,
        target_markets :company.operations?.target_markets,
        operational_areas : company.operations?.operational_areas,
        operations_territories : company.operations?.operations_territories,
        property_ownership :company.operations?.property_ownership
      })
      setShareholding({
        id :  company.shareholdings?.id ?? undefined,
        numbers_of_shareholders : company.shareholdings?.numbers_of_shareholders ?? 0,
        numbers_of_shares : company.shareholdings?.numbers_of_shares ?? 0,
        paid_up_capital: company.shareholdings?.paid_up_capital ? Number(company.shareholdings?.paid_up_capital) : undefined,
        authorized_capital: company.shareholdings?.authorized_capital ? Number(company.shareholdings?.authorized_capital) : undefined,
       
        shareholders: 
        company.shareholdings &&
        company.shareholdings.shareholders.length > 0 
        ? company.shareholdings?.shareholders.map(item => ({
          id : item.id ?? undefined,
          full_name :item.full_name,
          address  :item.address,
          number_of_shares :item.number_of_shares,
          percentage_ownership :Number(item.percentage_ownership)
        }))
        : [{
            full_name : "",
            address : "",
            number_of_shares: 0,   
          percentage_ownership: 0,    
        }]
      })
      setDirectors(
        company.directors&&
        company.directors.length > 0
        ? company.directors.map(item=>({
          id : item.id,
          full_name : item.full_name,
          gender : item.gender ?? "",
          dob : item.dob ?? "",
          position : item.position,
          address_latest :  item.address_latest ?? "",
          address_prev : item.address_prev ?? "",
          national_id : item.national_id ?? "",
          email : item.email ?? "",
          mobile_phone_number : item.mobile_phone_number ?? "",
          insolvencies_judgements : item.insolvencies_judgements ?? ""
        }))
        : [{
            full_name :"",
            gender: "male",
            position : "director",
            national_id : "",
            address_latest : "",
            email :"",
        }]
      )
      
    } else {
      
      const individual = report.subject as Individual
      setIndividualDetails({
        id: individual.id,
        full_name: individual.full_name ?? "",
        national_id: individual.national_id ?? "",
        date_of_birth: individual.date_of_birth ?? "",
        gender: individual.gender ?? "",
        marital_status: individual.marital_status ?? undefined,
        nationality: individual.nationality ?? "",
        residential_address: formatAddressToObject(individual.residential_address),
        mobile_number: individual.mobile_number ?? "",
        email: individual.email ?? "",
      })
      
      setEmploymentInformation({
        individual_id : individual.id,
        employer: individual.employment_information?.employer ?? "",
        position: individual.employment_information?.position ?? "",
        employment_status: individual.employment_information?.employment_status ?? undefined,
        years_employed: individual.employment_information?.years_employed ?? undefined,
        monthly_income: Number(individual.employment_information?.monthly_income ?? 0),
        previous_employer: individual.employment_information?.previous_employer ?? "",
      })
      
      setNextOfKin({
        individual_id : individual.id,
        name : individual.next_of_kin?.name ?? "",
        contact_number : individual.next_of_kin?.contact_number ?? "",
        relationship : individual.next_of_kin?.relationship ?? ""
      })
    }

    // setup common data
    setClaims(
      report.subject.claims.length > 0
      ? report.subject.claims.map(item => ({
        id: item.id,
        creditor_name: item.creditor_name,
        currency: item.currency,
        amount: Number(item.amount),
        claim_date: item.claim_date,
        status: item.status,
        debtor_object_id: item.debtor.extras.debtor_object_id,
        debtor_type: item.debtor.extras.debtor_type,   
        debtor_default : item.debtor.name
      }))
      : [
        { 
          creditor_name: "",
          currency: "USD",
          amount: 0,
          claim_date: "",
          status: "open",
          debtor_object_id: 0,
          debtor_type: "company",   
        } 
      ]
    )

    setAbsconders(
      report.subject.absconders.length > 0
      ? report.subject.absconders.map(item => ({
        id: item.id,
        creditor_name : item.creditor_name ?? "",
        currency : item.currency ?? "USD",
        amount : Number(item.amount),
        start_date: item.start_date,
        status : item.status,
        default_search : item.debtor.name,
        debtor_object_id: item.debtor.extras.debtor_object_id,
        debtor_type: item.debtor.extras.debtor_type, 
      }))
      : [{
        creditor_name : "",
        currency :"USD",
        amount : 0,
        start_date :"",
        status :"open",
        debtor_object_id: 0,
        debtor_type: "company", 
      }]
    )

    setCourtJudgements(
      report.subject.court_judgements.length > 0
      ? report.subject.court_judgements.map(item => ({
        id : item.id,
        case_number: item.case_number,
        court_name: item.court_name,
        currency : item.currency,
        amount : Number(item.amount),
        judgement_date : item.judgement_date
      }))
      : [{
        case_number: "",
        court_name: "",
        currency : "USD",
        amount : 0,
        judgement_date : ""
      }]
    )
    
    setInsolvencyRecords(
      report.subject.insolvency_records.length > 0
      ? report.subject.insolvency_records.map(item =>({
        id :item.id,
        insolvency_type : item.insolvency_type,
        start_date :item.start_date,
        end_date :item.end_date,
        court_reference:item.court_reference
      }))
      : [{
        insolvency_type : "insolvent",
        start_date :"",
        end_date :"",
        court_reference:""
      }]
    )

    setPublicInformation(
      report.subject.public_information.length > 0
      ? report.subject.public_information.map(item => ({
        id: item.id,
        summary: item.summary,
        link: item.link ?? "",
        record_date : item.record_date
      }))
      : [{
        summary: "",
        link: "",
        record_date: ""
      }]
    )

    setFinancials(
      report.subject.financials
      ? {
        id: report.subject.financials.id,
        total_assets: report.subject.financials.total_assets ? Number(report.subject.financials.total_assets) : undefined,
        net_profit: report.subject.financials.net_profit ?? "",
        net_worth: report.subject.financials.net_worth ?? "",
        total_revenue: report.subject.financials.total_revenue ?? "",
        financial_year: report.subject.financials.financial_year,
        asset_ratio : report.subject.financials.asset_ratio ? Number(report.subject.financials.asset_ratio) : undefined, 
        default_file :report.subject.financials.financials_file ?? undefined,
      }
      : undefined
    )
     
    setProfessionals(
      report.subject.professional_partners ?
      { 
        id: report.subject.professional_partners.id,
        lawyers : report.subject.professional_partners.lawyers,
        auditors : report.subject.professional_partners.auditors
      }: undefined
    )

    setAccounts(
      report.subject.registration_accounts ?
      {
        is_nssa_verified :report.subject.registration_accounts.is_nssa_verified,
        is_praz_verified : report.subject.registration_accounts.is_praz_verified,
        is_tin_verified : report.subject.registration_accounts.is_tin_verified,
        is_vat_verified : report.subject.registration_accounts.is_vat_verified,
        nssa_number : report.subject.registration_accounts.nssa_number ?? undefined,
        praz_number : report.subject.registration_accounts.praz_number ?? undefined,
        tin_number :report.subject.registration_accounts.tin_number ?? undefined,
        vat_number : report.subject.registration_accounts.vat_number?? undefined
      } : undefined
    )

    setTradeReferences(
      report.subject.trade_references.length > 0
      ? report.subject.trade_references.map(item => ({
        id : item.id ?? undefined,
        referenced_date : item.referenced_date,
        name : item.name ?? "",
        contact_info :item.contact_info ?? undefined,
        reference_source : item.reference_source ?? undefined,
        position : item.position ?? undefined,
        credit_limit : item.credit_limit ?? undefined,
        credit_terms : item.credit_terms ?? undefined,
        payment_trend : item.payment_trend ?? undefined
      }))
      : [{
        referenced_date : "",
        name : "",
      }]
    )

    setBankerDetails(
      report.subject.banker_accounts.length > 0
      ? report.subject.banker_accounts.map(item => ({
          id : item.id,
          bank: item.bank,
          branch: item.branch,
          account_name: item.account_name,
          account_type: item.account_type,
          account_currency: item.account_currency,  
          account_number: item.account_number,
          date_of_acquirement: item.date_of_acquirement,  
          bank_code: item.bank_code,            
          narration: item.narration,
      }))
      : [{
            bank: "",
            account_name: "",
            account_type: "current",
            account_currency: "ZiG",  
            account_number: "",
            date_of_acquirement: "",  
            bank_code: "",            
            narration: "C",
        }]
    )

    setReportDetails({
      overall_risk_rating : Number(report.overall_risk_rating),
      summary  :report.summary ?? ""
    })
  
    setClientType(report.client_type);
    setSubjectType(report.subject_type);
    setClientObjectId(report.client.id);
    setSubjectObjectId(report.subject.id);


  }, [report])

  const generateReport = (byPassCheck = false)=>{
    if(list_report) return
    if(!clientObjectId || !subjectObjectId) return;
    setReportLoading(true);

    const payload = {
      ...(username && { username : username,}),
      ...(subjectUniqueID && {subject_unique_id: subjectUniqueID}),
      ...(byPassCheck && {bypass_check : true}),
      client_object_id : clientObjectId,
      client_type :  clientType,
      subject_object_id : subjectObjectId,
      subject_type : subjectType,
    }

    mutate(payload, {
      onSuccess : (data: Report) => {
        setReport(data)   
        setHeaderEditMode(false)
        queryClient.invalidateQueries({
          queryKey : ["reports"]
        })
      },
      onError : (error) => {
        if(isAxiosError(error)){
          if(error.status === 409) setOpenMisMatchDialog(true)
        }
        handleAxiosError(error)
      },
      onSettled :()=> setReportLoading(false)
    })
  }

  const onClear = () => {
    setUsername("");
    setReport(undefined); 
    setDefaultHeader(undefined)
    setClientObjectId(null)
    setSubjectObjectId(null)
    setSubjectUniqueID(undefined)
    setHeaderEditMode(!list_report);
    setCompanyOverview(undefined);
    setIndividualDetails(undefined);
    setEmploymentInformation(undefined);
    setNextOfKin(undefined);
    setClaims([]);
    setAbsconders([]);
    setCourtJudgements([]);
    setInsolvencyRecords([]);
    setPublicInformation([]);
    setFinancials(undefined);
    setProfessionals(undefined);
    setAccounts(undefined);
    setTradeReferences([]);
    setBankerDetails([]);
    setCompanyStructure(undefined);
    setCompanyOperations(undefined);
    setShareholding(undefined);
    setDirectors([]);
    setReportDetails(undefined);
  };

  return { 
    subject_object_id : report?.subject.id ?? null,
    subject_type : report?.subject_type ?? null,
    claims,
    professionals,
    report,
    nextOfKin,
    companyOverview,
    username,
    directors,
    subjectUniqueID,
    isLocked,
    tradeReferences,
    individualDetails,
    companyStructure,
    employmentInformation,
    courtJudgements,
    defaultHeader,
    isLoading, 
    open, 
    clientType,
    reportDetails,
    subjectType,
    headerEditMode,
    shareholding,
    absconders,
    insolvencyRecords,
    publicInformation,
    bankerDetails,
    financials,
    openMisMatchDialog,
    accounts,
    companyOperations,
    companyInformation,
    onClear,
    setSubjectUniqueID,
    setOpenMisMatchDialog,
    setUsername,
    onEdit,
    setOpen,
    onSetEntityId,
    onSelectEntity,
    onUpdateEntityTypes,
    generateReport
  };
}

export default useAddReportDialogue;
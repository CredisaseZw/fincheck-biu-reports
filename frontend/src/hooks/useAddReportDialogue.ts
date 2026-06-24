import type { Company, DefaultHeaderProps, EntityMode, EntityValue, Individual, ListReport, Report} from "@/types/core";
import { useEffect, useState} from "react";
import useGetSingleReport from "./api/useGetSingleReport";
import { formatAddressToObject, getEntityName, handleAxiosError } from "@/lib/utils";
import type { CompanyFormData } from "./useCompanyDetails";
import { DEFAULT_ADDRESSES } from "@/constants";
import { useReport } from "@/contexts/ReportMutationContext";
import useCreateReport from "./api/useCreateReport";
import type { IndividualFormData } from "./useIndividualDetails";
import type { EmploymentFormData } from "./useEmploymentInformation";
import type { NextOfKinFormData } from "./useNextOfKin";
import type { ClaimFormData } from "./useClaims";
import type { AbsconderFormData } from "./useAbsconderDetails";
import type { CourtJudgementFormData } from "./useCourtDetails";
import type { InsolvencyRecordFormData } from "./useInsolvencyRecordsDetails";
import type { PublicInformationFormData } from "./usePublicInformation";
import type { FinancialEntryFormData } from "./useFinancialsDetails";

function useAddReportDialogue(list_report?: ListReport) {
  const [open, setOpen] = useState(false);  
  const { mutate } = useCreateReport();
  const { setReportLoading } = useReport()
  const [clientObjectId, setClientObjectId] = useState<number | null>(null);
  const [subjectObjectId, setSubjectObjectId] = useState<number | null>(null);
  const [clientType, setClientType] = useState<EntityValue>("company")
  const [subjectType, setSubjectType] = useState<EntityValue>("company")
  const [report, setReport] =useState<Report | undefined>(undefined)
  const [headerEditMode, setHeaderEditMode ] = useState<boolean>()
  const [defaultHeader, setDefaultHeader] = useState<DefaultHeaderProps | undefined>(undefined);
  const [companyOverview, setCompanyOverview] = useState<CompanyFormData | undefined>(undefined);
  const [individualDetails, setIndividualDetails] = useState<IndividualFormData | undefined>(undefined)
  const [employmentInformation, setEmploymentInformation] = useState<EmploymentFormData | undefined>(undefined);
  const [nextOfKin, setNextOfKin] = useState<NextOfKinFormData | undefined>(undefined);
  const [claims, setClaims] = useState<ClaimFormData[]>([])
  const [absconders, setAbsconders] = useState<AbsconderFormData[]>([])
  const [courtJudgements, setCourtJudgements] = useState<CourtJudgementFormData[]>([])
  const [insolvencyRecords, setInsolvencyRecords] = useState<InsolvencyRecordFormData[]>([])
  const [publicInformation, setPublicInformation] = useState<PublicInformationFormData[]>([])
  const [financials, setFinancials] = useState<FinancialEntryFormData | undefined>(undefined)

  const {data, isLoading, error } = useGetSingleReport({
    id : list_report?.id,
    subject_type :list_report?.subject_type,
    enabled :Boolean(list_report && open)
  });

  const onEdit = () => setHeaderEditMode(true)

  const onUpdateEntityTypes = ( entity :EntityMode, value: EntityValue)=>{
    if (entity === "client") {
      setClientType(value);
      return;
    }
    setSubjectType(value);
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
    if(handleAxiosError(error)) return 
    if(!data) return;

    setReport(data)
  },[error, data, open])

  useEffect(()=>{ // THIS EFFECT HANDLES DATA DIS ON EDIT MODE
    if(!report) return;

    setDefaultHeader({
      client_default_search : getEntityName(report.client),
      subject_default_search : getEntityName(report.subject),
      enquiry_reference : report.enquiry_reference,
      created_at : report.created_at
    })

    setClientType(report.client_type);
    setSubjectType(report.subject_type);
    setClientObjectId(report.client.id); // in case of these are edited
    setSubjectObjectId(report.subject.id);

    if(report.subject_type === "company"){
      const company = report.subject as Company
      setCompanyOverview({
        id: company.id,
        registered_name: company?.registered_name ?? "",
        trading_name: company?.trading_name ?? "",
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
        overview: {
            trading_status: company?.overview?.trading_status ?? "active",
            date_of_registration: company?.overview?.date_of_registration ?? "",
            legal_form: company?.overview?.legal_form ?? undefined,
            condition: company?.overview?.condition ?? "good",
            trend: company?.overview?.trend ?? "stable",
            number_of_employees: company?.overview?.number_of_employees ?? undefined,
            last_financial_result: company?.overview?.last_financial_result ?? undefined,
            net_asset_value: company?.overview?.net_asset_value ?? undefined,
            authorized_share_capital: company?.overview?.authorized_share_capital ?? undefined,
            issued_share_capital: company?.overview?.issued_share_capital ?? undefined,
        }, 
      })
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
        insolvency_type : "insolvency",
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
        net_profit: report.subject.financials.net_profit ? Number(report.subject.financials.net_profit) : undefined,
        net_worth: report.subject.financials.net_worth ? Number(report.subject.financials.net_worth) : undefined,
        total_revenue: report.subject.financials.total_revenue ? Number(report.subject.financials.total_revenue) : undefined,
        paid_up_capital: report.subject.financials.paid_up_capital ? Number(report.subject.financials.paid_up_capital) : undefined,
        authorized_capital: report.subject.financials.authorized_capital ? Number(report.subject.financials.authorized_capital) : undefined,
        financial_year: report.subject.financials.financial_year ?? undefined,
        financials_file: undefined,
      }
      : undefined
    )
    
  }, [report])

  useEffect(()=>{
    if(list_report) return;
    if(clientObjectId && subjectObjectId){
        setReportLoading(true);
        mutate({
            client_object_id : clientObjectId,
            client_type :  clientType,
            subject_object_id : subjectObjectId,
            subject_type : subjectType
        }, {
            onSuccess : (data: Report) => {
              setReport(data)   
              setHeaderEditMode(false)
            },
            onError : (error) => handleAxiosError(error),
            onSettled :()=> setReportLoading(false)

        })
    }
    }, [
      list_report,
      clientObjectId, 
      clientType, 
      subjectObjectId,
      subjectType,
      mutate, 
      setReportLoading
  ])

  const onClear = () => {
    setReport(undefined);
    setDefaultHeader(undefined)
    setClientObjectId(null)
    setSubjectObjectId(null)
    setHeaderEditMode(!list_report);
  };

  return { 
    subject_object_id : report?.subject.id ?? null,
    subject_type : report?.subject_type ?? null,
    claims,
    report,
    nextOfKin,
    companyOverview,
    individualDetails,
    employmentInformation,
    courtJudgements,
    defaultHeader,
    isLoading, 
    open, 
    clientType,
    subjectType,
    headerEditMode,
    absconders,
    insolvencyRecords,
    publicInformation,
    financials,
    onClear,
    onEdit,
    setOpen,
    onSetEntityId,
    onUpdateEntityTypes,
  
  };
}

export default useAddReportDialogue;
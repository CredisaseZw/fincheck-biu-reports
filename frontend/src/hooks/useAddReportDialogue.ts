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
  
  const {data, isLoading, error } = useGetSingleReport(
    list_report?.id,
    Boolean(list_report && open)
  );

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
    report,
    nextOfKin,
    companyOverview,
    individualDetails,
    employmentInformation,
    defaultHeader,
    isLoading, 
    open, 
    clientType,
    subjectType,
    headerEditMode,
    onClear,
    onEdit,
    setOpen,
    onSetEntityId,
    onUpdateEntityTypes,
  };
}

export default useAddReportDialogue;
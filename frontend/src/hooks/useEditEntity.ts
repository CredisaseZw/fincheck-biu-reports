import { useEffect, useState } from "react";
import type { CompanyOperationsFormData } from "./useCompanyOperations";
import type { CompanyOverviewFormData } from "./useCompanyOverview";
import type { CompanyStructureFormData } from "./useCompanyStructure";
import type { CompanyFormData } from "./useCompanyDetails";
import type { EmploymentFormData } from "./useEmploymentInformation";
import type { IndividualFormData } from "./useIndividualDetails";
import type { NextOfKinFormData } from "./useNextOfKin";
import type { Company, EntityInformationProps, Individual } from "@/types/core";
import useGetSingleEntity from "./api/useGetSingleEntity";
import { handleAxiosError } from "@/lib/utils";


const useEditEntity = ({entity_type, id}:EntityInformationProps) => {
    
    const [companyInformation, setCompanyInformation] = useState<CompanyFormData | undefined>(undefined);
    const [companyOverview, setCompanyOverview] = useState<CompanyOverviewFormData | undefined>(undefined);
    const [companyStructure, setCompanyStructure] = useState<CompanyStructureFormData | undefined>(undefined);
    const [companyOperations, setCompanyOperations] = useState<CompanyOperationsFormData | undefined>(undefined)
    const [individualDetails, setIndividualDetails] = useState<IndividualFormData | undefined>(undefined)
    const [employmentInformation, setEmploymentInformation] = useState<EmploymentFormData | undefined>(undefined);
    const [nextOfKin, setNextOfKin] = useState<NextOfKinFormData | undefined>(undefined);
    const{
        data,
        isError, 
        isLoading,
        error
    } = useGetSingleEntity({
        entity_type,
        id,
        enabled: true
    })

    useEffect(()=>{
        if(handleAxiosError(error)) return;
        if(!data) return;

        if(entity_type === "company"){
            const company = data as Company;
            setCompanyInformation({
                id: company.id,
                registration_number: company?.registration_number ?? "",
                registered_name: company?.registered_name ?? "",
                re_registration_number: company?.re_registration_number ?? "",
                trading_name: company?.trading_name ?? "",
                date_of_incorporation: company?.date_of_incorporation ?? "",
                date_of_registration: company?.date_of_registration ?? "",
                address_registered: company?.address_registered ?? "", 
                address_operations: company?.address_operations ?? "", 
                email: company?.email ?? "",
                telephone_number: company?.telephone_number ?? "",
                mobile_number: company?.mobile_number ?? "",
                website: company?.website ?? "",
                is_address_registered_verified: company?.is_address_registered_verified ?? true, 
            })
            setCompanyOverview({
                trading_status: company?.overview?.trading_status ?? "active",
                legal_form: company?.overview?.legal_form ?? undefined,
                number_of_employees: company?.overview?.number_of_employees ?? undefined,
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
        } else if (entity_type=== "individual"){
            const individual = data as Individual;
            setIndividualDetails({
                id: individual.id,
                full_name: individual.full_name ?? "",
                national_id: individual.national_id ?? "",
                date_of_birth: individual.date_of_birth ?? "",
                gender: individual.gender.length < 2 ? "unknown" : individual.gender,
                marital_status: individual.marital_status ?? undefined,
                nationality: individual.nationality ?? "",
                residential_address: individual.residential_address ??"",
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
        
    }, [data, error, entity_type])

    const clear = () =>{
        if (entity_type === "company"){
            setCompanyInformation(undefined)
            setCompanyOperations(undefined)
            setCompanyOverview(undefined)
            setCompanyStructure(undefined)
            setCompanyInformation(undefined)
        } else if(entity_type === "individual"){
            setIndividualDetails(undefined)
            setEmploymentInformation(undefined)
            setNextOfKin(undefined)
        }
    }

    return {
        companyInformation,
        companyOperations,
        companyStructure,
        companyOverview,
        individualDetails,
        employmentInformation,
        nextOfKin,
        isLoading,
        isError,
        clear
    }
}

export default useEditEntity
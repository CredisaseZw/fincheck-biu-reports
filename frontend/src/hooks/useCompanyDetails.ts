
import { ADDRESS_OBJECT, OPTIONAL_ADDRESS_OBJECT } from "@/constants";
import {  cleanPayload, formatAddressToString, handleAxiosError, handleTrackChangedFields } from "@/lib/utils";
import type { Address, Company, EntityValue, Report } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { z } from "zod"
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import { toast } from "sonner";
import { useEffect } from "react";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { useQueryClient } from "@tanstack/react-query";

const TradingStatus = z.enum(["active", "inactive", "suspended"])
const Condition = z.enum(["good", "fair", "poor"])
const Trend = z.enum(["improving", "stable", "declining"])
const LegalForm = z.enum([
    "pvt_ltd",
    "plc",
    "pbc",
    "partnership",
    "trust",
    "joint_venture",
    "cooperative",
    "sole_trader",
])
export const LegalForms = LegalForm.options;
const companyOverviewSchema = z.object({
    date_of_registration: z.string().optional(),    
    legal_form: LegalForm.optional(),
    trading_status: TradingStatus.optional(),
    condition: Condition.optional(),
    trend: Trend.optional(),
    number_of_employees: z.number().optional(),
    last_financial_result: z.string().optional(),
    net_asset_value: z.string().optional(),
    authorized_share_capital: z.string().optional(),
    issued_share_capital: z.string().optional()
})

const companySchema = z.object({
    id : z.number().optional(),
    registered_name: z.string().min(1, "Registered name is required").max(50, "Company Name too long."),
    registration_number: z.string().optional(),
    trading_name: z.string().max(255).optional(),
    address_registered: ADDRESS_OBJECT,
    address_operations: OPTIONAL_ADDRESS_OBJECT.optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    telephone_number: z.string().max(20).optional(),
    mobile_number: z.string().max(20).optional(),
    website: z.string()
    .refine(
        val => !val || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(val),
        "Invalid URL"
    )
    .optional(),    
    is_address_registered_verified: z.boolean().optional(),
    overview: companyOverviewSchema.optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>
interface props {
    subject_type: EntityValue | null
    report_id?: number | undefined
    company_overview: CompanyFormData | undefined,
    onSuccess? : (id: number) => void
}
function useCompanyDetails({company_overview, report_id, subject_type}:props) {
    const {mutate, isPending } = useInstanceMutation()
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const client = useQueryClient()

    const {
        reset,
        getValues,
        register,
        handleSubmit,
        formState : { errors },
        control,
    } = useForm<CompanyFormData>({
        resolver : zodResolver(companySchema),
        defaultValues : company_overview
    })

    useEffect(() => {
        if (company_overview) {
            reset(company_overview);
        }
    }, [company_overview, reset]);

    const onSubmit = (data: CompanyFormData) => {
        delete data.id;
        let message = "Company successfully created."
        const PAYLOAD:InstanceMutation = {
            url : "",
            mode : "create"
        }

        if(!company_overview){ 
            const DATA:any = cleanPayload(data)
            if(DATA.address_registered){
                DATA.address_registered = formatAddressToString(DATA.address_registered)
            }

            if(DATA.address_operations){
                DATA.address_operations = formatAddressToString(DATA.address_operations)
            }

            PAYLOAD.url = "/api/companies/"
            PAYLOAD.data = DATA
        }
        else{
            const {id, ...initial_data} = company_overview;
            const changes = handleTrackChangedFields(initial_data, data)
            if(!changes) return
            
            if(changes.address_registered){
                changes.address_registered = formatAddressToString(data.address_registered)
            }
            if(changes.address_operations){
                changes.address_operations = formatAddressToString(data.address_operations as Address)
            }
            message = "Information successfully updated."
            PAYLOAD.url = `/api/companies/${id}/`
            PAYLOAD.mode = "update"
            PAYLOAD.data = changes;
        }
        
        mutate(PAYLOAD,{
            onSuccess : (data: Company)=>{
                client.invalidateQueries({
                    queryKey : ["reports"]
                })
                cache.set(["subject"], data)
                toast.info(message)
            },
            onError:(error)=>handleAxiosError(error)
        } )
    }

    return {
        onSubmit,
        register,
        getValues,
        handleSubmit,
        isPending,
        control,
        errors,
    }
}

export default useCompanyDetails
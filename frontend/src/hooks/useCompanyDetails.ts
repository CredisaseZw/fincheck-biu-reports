import {  cleanPayload, genStorageKey, handleAxiosError, handleTrackChangedFields } from "@/lib/utils";
import type { Company, EntityValue, Report } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { z } from "zod"
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { useQueryClient } from "@tanstack/react-query";
import { getItem } from "@/lib/storage";
import useSectionTouched from "./useSectionTouched";

const companySchema = z.object({
    id : z.number().optional(),
    date_of_registration: z.string().optional(),    
    date_of_incorporation: z.string().optional(),
    registered_name: z.string().min(1, "Registered name is required").max(50, "Company Name too long."),
    registration_number: z.string().optional(),
    re_registration_number: z.string().optional(),
    trading_name: z.string().max(255),
    address_registered: z.string().min(1, "Registered address is required"),
    address_operations: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    telephone_number: z.string().optional(),
    mobile_number: z.string().optional(),
    website: z.string()
    .refine(
        val => !val || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(val),
        "Invalid URL"
    )
    .optional(),    
    is_address_registered_verified: z.boolean().optional(),
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
    const client = useQueryClient()
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "company_details"), [report_id,subject_type])
    const { onTouched, touched } = useSectionTouched(CACHE_KEY)
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

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched") onTouched();
    }, [report_id, subject_type, CACHE_KEY, onTouched])

    const onSubmit = (data: CompanyFormData) => {
        delete data.id;
        let message = "Company successfully created."
        const PAYLOAD:InstanceMutation = {
            url : "",
            mode : "create"
        }

        if(!company_overview){ 
            const DATA:any = cleanPayload(data)
            PAYLOAD.url = "/api/companies/"
            PAYLOAD.data = DATA
        }
        else{
            const {id, ...initial_data} = company_overview;
            const changes = handleTrackChangedFields(initial_data, data)
            if(!changes) {
                onTouched()
                return
            }
            
            message = "Information successfully updated."
            PAYLOAD.url = `/api/companies/${id}/`
            PAYLOAD.mode = "update"
            PAYLOAD.data = changes;
        }
        
        mutate(PAYLOAD,{
            onSuccess : (data: Company) => {
                client.invalidateQueries({
                    queryKey : ["reports"]
                })
                cache.set(["subject"], data)
                toast.info(message)
                onTouched()

            },
            onError:(error)=>handleAxiosError(error)
        } )
    }

    return {
        onSubmit,
        register,
        getValues,
        onTouched,
        handleSubmit,
        isPending,
        control,
        errors,
        touched,
    }
}

export default useCompanyDetails
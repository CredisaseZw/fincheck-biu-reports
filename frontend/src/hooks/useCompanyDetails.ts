
import { ADDRESS_OBJECT, OPTIONAL_ADDRESS_OBJECT } from "@/constants";
import {  cleanPayload, formatAddressToString, genStorageKey, handleAxiosError, handleTrackChangedFields } from "@/lib/utils";
import type { Address, Company, EntityValue, Report } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { z } from "zod"
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import { toast } from "sonner";
import { useState,  useEffect, useMemo } from "react";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { useQueryClient } from "@tanstack/react-query";
import { getItem, setItem } from "@/lib/storage";

const companySchema = z.object({
    id : z.number().optional(),
    date_of_registration: z.string().optional(),    
    registered_name: z.string().min(1, "Registered name is required").max(50, "Company Name too long."),
    registration_number: z.string().optional(),
    trading_name: z.string().max(255),
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
    const [touched, setTouched] = useState(false)
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const client = useQueryClient()
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "company_details"), [report_id,subject_type])

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
        if(state === "touched"){
            setTouched(true)
        }
    }, [report_id, subject_type, CACHE_KEY])

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
            if(!changes) {
                setItem(CACHE_KEY, "touched")
                setTouched(true)
                return
            }
            
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
            onSuccess : (data: Company) => {
         
                client.invalidateQueries({
                    queryKey : ["reports"]
                })
                cache.set(["subject"], data)
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                toast.info(message)
                setTouched(true)   

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
        touched,
    }
}

export default useCompanyDetails
import { useForm } from "react-hook-form" 
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect, useMemo } from "react";
import type { Company, Individual, RegistrationsAccountsProps, Report } from "@/types/core";
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { toast } from "sonner";
import { handleAxiosError, handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { getItem } from "@/lib/storage";
import useSectionTouched from "./useSectionTouched";

const schema = z.object({
    id : z.number().optional(),
    tin_number : z.string().optional(),
    vat_number : z.string().optional(),
    nssa_number : z.string().optional(),
    praz_number : z.string().optional(),
    tax_clearance_expiration_date : z.string().optional(),
    is_tax_clearance_expiration_date : z.boolean().optional(),
    is_praz_verified : z.boolean().optional(),
    is_nssa_verified : z.boolean().optional(),
    is_vat_verified : z.boolean().optional(),
    is_tin_verified : z.boolean().optional(),
})

export type RegistrationAccountsFormData = z.infer<typeof schema>;

function useRegistrationAccounts({
    report_id,
    subject_object_id,
    subject_type,
    accounts_data
}:RegistrationsAccountsProps) {
    const {
        handleSubmit,
        register,
        reset,
        control,
        formState : { errors }
    } = useForm<RegistrationAccountsFormData>({
        resolver: zodResolver(schema),
        defaultValues : accounts_data
    })
    useEffect(()=>{
        if(accounts_data){
            reset(accounts_data)
        }
    }, [reset, accounts_data])

    const {mutate, isPending} = useInstanceMutation();
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "registration_accounts_details"), [report_id,subject_type])
    const { onTouched, touched } = useSectionTouched(CACHE_KEY);

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched") onTouched();
    }, [report_id, subject_type, CACHE_KEY, onTouched])

    const onSubmit = (data : RegistrationAccountsFormData) =>{
        if(!subject_object_id || !subject_type){
            toast.error("No working report loaded.")
            return;
        }
        
        const changes = handleTrackChangedFields(accounts_data, data);
        if(!changes){
            onTouched()
            return;
        }

        const PAYLOAD:InstanceMutation ={
            url : subject_type === "company"
            ? `/api/companies/${subject_object_id}/`
            : `/api/individuals/${subject_object_id}/`,
            mode : "update",
            data : {
                registration_accounts:  changes
            }
        }
        mutate(PAYLOAD, {
            onSuccess : (data: Company | Individual) => {
                cache.set(["subject", "registration_accounts"], data.registration_accounts)
                toast.success("Registration accounts Updated successfully.")
                onTouched()
      },
            onError : (error) => handleAxiosError(error)
        })

    }

    return {
        handleSubmit,
        onSubmit,
        register,
        onTouched,
        control,
        touched,
        errors,
        isPending, 
    }
}

export default useRegistrationAccounts
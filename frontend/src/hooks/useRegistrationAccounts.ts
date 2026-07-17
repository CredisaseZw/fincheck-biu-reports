import { useForm } from "react-hook-form" 
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState,  useEffect, useMemo } from "react";
import type { Company, Individual, RegistrationsAccountsProps, Report } from "@/types/core";
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { toast } from "sonner";
import { handleAxiosError, handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { getItem, setItem } from "@/lib/storage";

const schema = z.object({
    id : z.number().optional(),
    tin_number : z.string().optional(),
    vat_number : z.string().optional(),
    nssa_number : z.string().optional(),
    praz_number : z.string().optional(),
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

    const [touched, setTouched] = useState(false)
    const {mutate, isPending} = useInstanceMutation();
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "registration_accounts_details"), [report_id,subject_type])

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched"){
            setTouched(true)
        }
    }, [report_id, subject_type, CACHE_KEY])

    const onSubmit = (data : RegistrationAccountsFormData) =>{
        if(!subject_object_id || !subject_type){
            toast.error("No working report loaded.")
            return;
        }
        
        const changes = handleTrackChangedFields(accounts_data, data);
        if(!changes){
            setItem(CACHE_KEY, "touched")
            setTouched(true)
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
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                toast.success("Registration accounts Updated successfully.")
                setTouched(true)
      },
            onError : (error) => handleAxiosError(error)
        })

    }


    return {
        handleSubmit,
        onSubmit,
        register,
        control,
        touched,
        errors,
        isPending, 
  }
}

export default useRegistrationAccounts
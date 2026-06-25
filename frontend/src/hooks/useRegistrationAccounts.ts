import { useForm } from "react-hook-form" 
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect } from "react";
import type { RegistrationsAccountsProps, Report } from "@/types/core";
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { toast } from "sonner";
import { handleAxiosError, handleTrackChangedFields } from "@/lib/utils";

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

    const {mutate, isPending} = useInstanceMutation();
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])

    const onSubmit = (data : RegistrationAccountsFormData) =>{
        if(!subject_object_id || !subject_type){
            toast.error("No working report loaded.")
            return;
        }
        
        const changes = handleTrackChangedFields(accounts_data, data);
        if(!changes){
            toast.info("No changes made.")
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
            onSuccess:(data)=>{
                cache.set(["subject"], data)
                toast.success("Registration accounts Updated successfully.")
            },
            onError : (error) => handleAxiosError(error)
        })

    }


    return {
        handleSubmit,
        onSubmit,
        register,
        control,
        errors,
        isPending, 
  }
}

export default useRegistrationAccounts
import { useForm } from "react-hook-form" 
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Company, Individual, ProfessionalsProps, Report } from "@/types/core";
import { useState,  useEffect, useMemo } from "react";
import { toast } from "sonner";
import { handleAxiosError, handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { getItem, setItem } from "@/lib/storage";
import type { InstanceMutation } from "./api/useInstanceMutation";
import useInstanceMutation from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";

const schema = z.object({
    id : z.number().optional(),
    auditors : z.string().optional(),
    lawyers  : z.string().optional()
})

export type ProfessionalsFormData = z.infer<typeof schema>

function useProfessionalPartners({
    subject_object_id,
    subject_type,
    report_id,
    professionals_data
}:ProfessionalsProps) {
    const {
        reset,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfessionalsFormData>({
        resolver: zodResolver(schema),
        defaultValues: professionals_data,
    })
    useEffect(()=>{
        if(professionals_data){
            reset(professionals_data)
        }
    }, [reset, professionals_data])

    const [touched, setTouched] = useState(false)
    const {mutate, isPending} = useInstanceMutation();
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "professional_partners_details"), [report_id,subject_type])

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched"){
            setTouched(true)
        }
    }, [report_id, subject_type, CACHE_KEY])

    const onSubmit = (data : ProfessionalsFormData) =>{
        if(!subject_object_id || !subject_type){
            toast.error("No working report loaded.")
            return;
        }
        
        const changes = handleTrackChangedFields(professionals_data, data);
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
                professional_partners :  changes
            }
        }
        mutate(PAYLOAD, {
            onSuccess : (data:Company | Individual) => {
                cache.set(["subject", "professional_partners"], data.professional_partners)
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                toast.success("Professional Updated successfully.")
                setTouched(true)
      },
            onError : (error) => handleAxiosError(error)
        })

    }

    return {
    touched,
        onSubmit,
        register,
        handleSubmit,
        errors,
        isPending
    }
}

export default useProfessionalPartners
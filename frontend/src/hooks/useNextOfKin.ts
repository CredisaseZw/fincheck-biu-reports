import { zodResolver } from "@hookform/resolvers/zod"
import { useState,  useEffect, useMemo } from "react";
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { InstanceMutation } from "./api/useInstanceMutation";
import useInstanceMutation from "./api/useInstanceMutation";
import { handleAxiosError, handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { getItem, setItem } from "@/lib/storage";
import { toast } from "sonner";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import type { EntityValue, Individual, Report } from "@/types/core";

const nextOfKinSchema = z.object({
    individual_id : z.number().optional(),
    name: z.string().min(1, "Name is required").max(255),
    relationship: z.string().min(1, "Relationship is required").max(100),
    contact_number: z.string().min(1, "Contact number is required").max(50),
})

export type NextOfKinFormData = z.infer<typeof nextOfKinSchema>
interface props {
    subject_type : EntityValue | null
    next_of_kin: NextOfKinFormData | undefined
    report_id : number | undefined
}
function useNextOfKin({next_of_kin, report_id, subject_type}:props) {
    const {
        reset,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<NextOfKinFormData>({
        resolver: zodResolver(nextOfKinSchema),
        defaultValues: next_of_kin
    })

    useEffect(()=>{
        if(next_of_kin){
            reset(next_of_kin)
        }
    },[reset, next_of_kin])
    const [touched, setTouched] = useState(false)
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "next_of_kin_details"), [report_id,subject_type])
    const {mutate, isPending} = useInstanceMutation()

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched"){
            setTouched(true)
        }
    }, [report_id, subject_type, CACHE_KEY])

    const onSubmit = (data: NextOfKinFormData) => {
        if(!next_of_kin){
            toast.error("An error occurred", {
                description : "An individual instance is required"
            })
            return;
        }
        const { individual_id, ...init }= next_of_kin
        delete data.individual_id;

        const PAYLOAD: InstanceMutation = {
            url: `/api/individuals/${individual_id}/`,
            mode: "update",
        }
        
        const changes = handleTrackChangedFields(init, data);
        if (!changes) {
            setItem(CACHE_KEY, "touched")
            setTouched(true)
            return;
        }
        PAYLOAD.data = { next_of_kin: changes }
    
        mutate(PAYLOAD, {
            onSuccess : (data:Individual) => {
                cache.set(["subject", "next_of_kin"], data.next_of_kin)
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                toast.success("Information successfully updated")
                setTouched(true)
            },
            onError: (error) => handleAxiosError(error)
        })
    }

    return { 
        onSubmit,
        register, 
        handleSubmit, 
        errors,
        touched,
        isPending
    }
}

export default useNextOfKin
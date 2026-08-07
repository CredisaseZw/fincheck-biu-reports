import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { InstanceMutation } from "./api/useInstanceMutation";
import useInstanceMutation from "./api/useInstanceMutation";
import { handleAxiosError, handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { getItem } from "@/lib/storage";
import { toast } from "sonner";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import type { EntityValue, Individual, Report } from "@/types/core";
import useSectionTouched from "./useSectionTouched";

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
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "next_of_kin_details"), [report_id,subject_type])
    const {onTouched, touched} =useSectionTouched(CACHE_KEY);
    const {mutate, isPending} = useInstanceMutation()

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched") onTouched();
    }, [report_id, subject_type, CACHE_KEY, onTouched])

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
            onTouched();
            return;
        }
        PAYLOAD.data = { next_of_kin: changes }
    
        mutate(PAYLOAD, {
            onSuccess : (data:Individual) => {
                cache.set(["subject", "next_of_kin"], data.next_of_kin)
                toast.success("Information successfully updated")
                onTouched()
            },
            onError: (error) => handleAxiosError(error)
        })
    }

    return { 
        onTouched,
        onSubmit,
        register, 
        handleSubmit, 
        errors,
        touched,
        isPending,
    }
}

export default useNextOfKin
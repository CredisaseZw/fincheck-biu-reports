import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { InstanceMutation } from "./api/useInstanceMutation";
import { cleanPayload, formatAddressToString, handleAxiosError, handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { getItem } from "@/lib/storage";
import useInstanceMutation from "./api/useInstanceMutation";
import { toast } from "sonner";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import type { Report } from "@/types/core";
import { useQueryClient } from "@tanstack/react-query";
import { GENDERS } from "@/constants";
import useSectionTouched from "./useSectionTouched";

const MaritalStatus = z.enum(["single", "married", "divorced", "widowed"], {message : "Marital Status is required"})

export const individualSchema = z.object({
    id: z.number().optional(),
    full_name: z.string().min(1, "Full name is required").max(255),
    national_id : z.string().min(1, "A valid Zimbabwe national ID or passport number is required"),
    date_of_birth: z.string().optional(),
    gender: GENDERS,
    marital_status: MaritalStatus.optional(),
    nationality: z.string().optional(),
    mobile_number: z.string().min(1, "Mobile number is required").max(50),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    residential_address: z.string().min(1, "Residential address is required"),
})

export type IndividualFormData = z.infer<typeof individualSchema>

interface props {
    individual_details: IndividualFormData | undefined,
    report_id: number | undefined
}

function useIndividualDetails({individual_details, report_id}:props) {
    const {mutate, isPending} = useInstanceMutation()
    const cache = useDetailCacheUpdate<Report>(["report", report_id])
    const client = useQueryClient()
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, "individual", "individual_details"), [report_id])
    const { onTouched, touched }= useSectionTouched(CACHE_KEY)

    const {
        control,
        reset,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IndividualFormData>({
        resolver: zodResolver(individualSchema),
        defaultValues: individual_details
    })

    useEffect(()=>{
        if(individual_details){
            reset(individual_details)
        }
    }, [individual_details, reset])

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched") onTouched();
    }, [report_id, CACHE_KEY, onTouched])

    const onSubmit = (data: IndividualFormData) => {
        delete data.id;
        const PAYLOAD:InstanceMutation = {
            url :"",
            mode : "create"
        }

        if(!individual_details){
            const DATA:any = cleanPayload(data)
            if(DATA.residential_address){
                DATA.residential_address = formatAddressToString(DATA.residential_address)
            }
            PAYLOAD.url = "/api/individuals/"
            PAYLOAD.data = DATA
        } else{
            const {id, ...initial_data} = individual_details;
            const changes = handleTrackChangedFields(initial_data, data);
            if(!changes) {
                onTouched();
                return;
            }
            
            PAYLOAD.url = `/api/individuals/${id}/`
            PAYLOAD.mode = "update"
            PAYLOAD.data = changes
        }

        mutate(PAYLOAD, {
            onSuccess : (data) => {
                cache.set(["subject"], data)
                client.invalidateQueries({
                    queryKey : ["reports"]
                })
                toast.success("Information successfully updated")
                onTouched()
            },
            onError: (error) => handleAxiosError(error)
        })
    }

    return {
        touched, 
        errors,
        control, 
        isPending,
        handleSubmit,
        onSubmit,
        register,
        onTouched
    }
}

export default useIndividualDetails
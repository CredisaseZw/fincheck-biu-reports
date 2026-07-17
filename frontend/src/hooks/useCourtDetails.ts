import { handleAxiosError, handleTrackChangedArray, genStorageKey } from "@/lib/utils";
import { getItem, setItem } from "@/lib/storage";
import type { CourtJudgementsProps, Report } from "@/types/core";
import {zodResolver} from "@hookform/resolvers/zod"
import { useState,  useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod"
import type { InstanceMutation } from "./api/useInstanceMutation";
import useInstanceMutation from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { CURRENCY } from "@/constants";

const schema = z.object({
    id : z.number().optional(),
    court_name : z.string().min(1,"Court name is required"),
    case_number : z.string().min(1,"A valid case number is required"),
    currency :CURRENCY,
    amount : z.number("Please enter a valid amount").positive("Value should be a positive number"),
    judgement_date :  z.string().min(1, "Date is required")
})
const courtsSchema = z.object({
    court_judgements : z.array(
        schema
    )
})

export type CourtJudgementFormData = z.infer<typeof schema>
type CourtJudgementsFormData = z.infer<typeof courtsSchema>

function useCourtDetails({
    court_judgements_data,
    subject_object_id,
    subject_type,
    report_id
}:CourtJudgementsProps) {
    const {
        getValues,
        reset,
        register,
        handleSubmit,
        control,
        formState : {errors}
    } = useForm({
        resolver : zodResolver(courtsSchema),
        defaultValues :{
            court_judgements : court_judgements_data
        }
    })

    useEffect(()=>{
        if(court_judgements_data){
            reset({
                court_judgements : court_judgements_data
            })
        }
    }, [reset, court_judgements_data])

    const cache = useDetailCacheUpdate<Report>(['report', subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "court_details"), [report_id,subject_type])
    const {mutate, isPending} = useInstanceMutation()
    const [touched, setTouched] = useState(false)

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched"){
            setTouched(true)
        }
    }, [report_id, subject_type, CACHE_KEY])
    const {fields, append, remove} = useFieldArray({
        control,
        name : "court_judgements"
    })

    const onSubmit = (data: CourtJudgementsFormData) =>{
        if(!subject_object_id || !subject_type){
            toast.error("No working report loaded.")
            return;
        }
        const changes = handleTrackChangedArray(court_judgements_data, data.court_judgements,)
        if(changes.length === 0){
            setItem(CACHE_KEY, "touched")
            setTouched(true)
            return
        }
        const payload: InstanceMutation = {
            url : "/api/credit-records/court-judgements/",
            mode : "update",
            data : {
                subject_object_id, 
                subject_type,
                court_judgements : changes
            }
        }
    
        mutate(payload, {
            onSuccess : (data) => {
                cache.set(["subject", "court_judgements"], data.court_judgements)
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                toast.success("Court Judgements updated successfully")
                setTouched(true)
            },
            onError :(error) => handleAxiosError(error)
        })
    }

    const onDelete = (id: number) =>{
        mutate({
            url : `/api/credit-records/court_judgements/${id}/`,
            mode:  "deletion"
        },{
            onSuccess : () => {
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                cache.removeFromList(["subject", "court_judgements"], id)
                toast.success("Court Judgement row deleted successfully")
                setTouched(true)            
            },
            onError : (error) => handleAxiosError(error)
        })
    }

    return {
        touched,   
        fields,
        errors,
        control,
        isPending,
        handleSubmit,
        append,
        register,
        remove,
        onSubmit,
        onDelete,
        getValues
    }
}

export default useCourtDetails
import type { Report, ReportDetailsProps } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState,  useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { handleAxiosError, handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { getItem, setItem } from "@/lib/storage";
import { toast } from "sonner";
import type { InstanceMutation } from "./api/useInstanceMutation";
import useInstanceMutation from "./api/useInstanceMutation";

const schema = z.object({
    overall_risk_rating :z.number().positive(),
    summary:z.string().optional()
})

export type ReportDetailsFormData = z.infer<typeof schema>

function useReportDetails({
    subject_type,
    report_data,
    report_id
}:ReportDetailsProps) {
    const {
      handleSubmit,
      reset,
      register,
      formState : {errors},  
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: report_data
    })
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const {mutate, isPending}= useInstanceMutation()
    const [touched, setTouched] = useState(false)
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "report_details"), [report_id,subject_type])

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched"){
            setTouched(true)
        }
    }, [report_id, subject_type, CACHE_KEY])
    useEffect(()=>{
        if(report_data){
            reset(report_data)
        }
    }, [reset, report_data])

    const onSubmit =(data: ReportDetailsFormData) =>{
        const changes = handleTrackChangedFields(report_data, data)
        if(!changes){
            setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
            setTouched(true)
            return
        }   
    
        const p: InstanceMutation = {
            url : `/api/reports/${report_id}/`,
            mode : "update",
            data : changes
        } 
        mutate(p,{
            onSuccess : (data: Report) => {
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                toast.info("Report details saved.")
                if(changes.overall_risk_rating)cache.set(["overall_risk_rating"], data.overall_risk_rating);
                if(changes.summary)cache.set(["summary"], data.summary);
                setTouched(true)
      },
            onError : (e)=> handleAxiosError(e)
        })
    }

    return {
        touched,
        isPending,
        errors,
        register,
        handleSubmit,
        onSubmit
    }
}

export default useReportDetails
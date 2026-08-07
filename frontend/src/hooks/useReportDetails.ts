import type { Report, ReportDetailsProps } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { handleAxiosError, handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { getItem } from "@/lib/storage";
import { toast } from "sonner";
import type { InstanceMutation } from "./api/useInstanceMutation";
import useInstanceMutation from "./api/useInstanceMutation";
import useSectionTouched from "./useSectionTouched";

const schema = z.object({
    overall_risk_rating :z.string().min(1, "Overall risk rating is required"),
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
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "report_details"), [report_id,subject_type])
    const {onTouched, touched} =useSectionTouched(CACHE_KEY);

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched") onTouched();
    }, [report_id, subject_type, CACHE_KEY, onTouched])

    useEffect(()=>{
        if(report_data){
            reset(report_data)
        }
    }, [reset, report_data])

    const onSubmit =(data: ReportDetailsFormData) =>{
        const changes = handleTrackChangedFields(report_data, data)
        if(!changes){
            onTouched();
            return
        }   
    
        const p: InstanceMutation = {
            url : `/api/reports/${report_id}/`,
            mode : "update",
            data : changes
        } 
        mutate(p,{
            onSuccess : (data: Report) => {
                toast.info("Report details saved.")
                if(changes.overall_risk_rating)cache.set(["overall_risk_rating"], data.overall_risk_rating);
                if(changes.summary)cache.set(["summary"], data.summary);
                onTouched();
      },
            onError : (e)=> handleAxiosError(e)
        })
    }

    return {
        touched,
        isPending,
        errors,
        register,
        onTouched,
        handleSubmit,
        onSubmit,
    }
}

export default useReportDetails
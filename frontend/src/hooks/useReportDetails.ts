import type { Report, ReportDetailsProps } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState,  useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { handleAxiosError, handleTrackChangedFields } from "@/lib/utils";
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
    useEffect(()=>{
        if(report_data){
            reset(report_data)
        }
    }, [reset, report_data])

    const onSubmit =(data: ReportDetailsFormData) =>{
        const changes = handleTrackChangedFields(report_data, data)
        if(!changes){
            toast.info("No changes made.")
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
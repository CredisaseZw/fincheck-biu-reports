import { handleAxiosError, handleTrackChangedArray, genStorageKey } from "@/lib/utils";
import { getItem, setItem } from "@/lib/storage";
import type { InsolvencyRecordsProps, Report } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState,  useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {z} from "zod"
import type { InstanceMutation } from "./api/useInstanceMutation";
import useInstanceMutation from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";

const InsolvencyType = z.enum(["insolvent", "judicial_management"])

const schema = z.object({
    id:z.number().optional(),
    insolvency_type : InsolvencyType,
    start_date: z.string().min(1, "Start Date is required"),
    end_date: z.string().min(1, "End date is required."),
    court_reference : z.string().min(1, "Court Reference.")
})

const insolvencyRecordsSchema = z.object({
    insolvency_records : z.array(schema)
})

export type InsolvencyRecordFormData = z.infer<typeof schema>
type InsolvencyRecordsFormData = z.infer<typeof insolvencyRecordsSchema>

function useInsolvencyRecordsDetails({
    insolvency_data,
    subject_object_id,
    subject_type,
    report_id
}: InsolvencyRecordsProps) {
    const {
        reset,
        register,
        getValues,
        handleSubmit,
        control,
        formState : {errors}
    } = useForm({
        resolver : zodResolver(insolvencyRecordsSchema),
        defaultValues :{
            insolvency_records : insolvency_data
        }
    })
    const { mutate, isPending } = useInstanceMutation()
    const [touched, setTouched] = useState(false)
    const cache =  useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "insolvency_records_details"), [report_id,subject_type])

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched"){
            setTouched(true)
        }
    }, [report_id, subject_type, CACHE_KEY])

    useEffect(()=>{
        if(insolvency_data){
            reset({
                insolvency_records : insolvency_data
            })
        }
    }, [reset, insolvency_data])

    const {fields, append, remove} = useFieldArray({
        control,
        name : "insolvency_records"
    })

    const onSubmit = (data: InsolvencyRecordsFormData) => {
        if(!subject_object_id || !subject_type){
            toast.error("No working report loaded.")
            return;
        }
        const changes = handleTrackChangedArray(insolvency_data, data.insolvency_records,)
        if(changes.length === 0){
            setItem(CACHE_KEY, "touched")
            setTouched(true)
            return
        }
        const payload: InstanceMutation = {
            url : "/api/credit-records/insolvency-records/",
            mode : "update",
            data : {
                subject_object_id, 
                subject_type,
                insolvency_records : changes
            }
        }
    
        mutate(payload, {
            onSuccess : (data) => {
                cache.set(["subject", "insolvency_records"], data.insolvency_records)
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                toast.success("Insolvency records updated successfully")
                setTouched(true)
      },
            onError :(error) => handleAxiosError(error)
        })
    }

    const onDelete = (id: number) =>{
        mutate({
            url : `/api/credit-records/insolvency_records/${id}/`,
            mode:  "deletion"
        }, {
            onSuccess : () => {
                cache.removeFromList(["subject", "insolvency_records"], id)
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                toast.success("Insolvency record row deleted successfully")
                setTouched(true)
      },
            onError : (error) => handleAxiosError(error)
        })
    }


    return {
        touched,
        control,
        errors,
        fields,
        isPending,
        append,
        onDelete,
        register,
        handleSubmit,
        remove,
        onSubmit,
        getValues
    }
}

export default useInsolvencyRecordsDetails
import { handleAxiosError, handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { getItem, setItem } from "@/lib/storage";
import type { Company, CompanyOperationsProps } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod"
import { useState,  useEffect, useMemo } from "react";
import { useForm } from "react-hook-form"
import { toast } from "sonner";
import { z } from "zod"
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";

const PaymentScope =  z.enum(["cash_only", "cash_and_credit", "credit_only",])

const companyOperationsSchema = z.object({
    industry: z.string().max(255).optional(),
    target_markets: z.string().optional(),
    operations_territories: z.string().optional(),
    property_ownership: z.string().optional(),
    operational_areas: z.string().optional(),
    import_export: z.string().optional(),
    sales_payment_terms: PaymentScope.optional(),
    purchases_payment_terms: PaymentScope.optional(),
    purchase_supplier_scope : z.enum(["local", "local_&_international", "international"]).optional()    
})

export type CompanyOperationsFormData = z.infer<typeof companyOperationsSchema>

function useCompanyOperations({  
    report_id,
    subject_object_id,
    operations_data,
    subject_type}:CompanyOperationsProps) {
    const {
        getValues,
        reset,
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<CompanyOperationsFormData>({
        resolver: zodResolver(companyOperationsSchema),
        defaultValues: operations_data
    })
    const [touched, setTouched] = useState(false)
    const {mutate, isPending} = useInstanceMutation()
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "operations_details"), [report_id,subject_type])


    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched"){
            setTouched(true)
        }
    }, [report_id, subject_type, CACHE_KEY])
    useEffect(()=>{
        if(operations_data){
            reset(operations_data)
        }
    }, [reset, operations_data])

    const onSubmit = (data: CompanyOperationsFormData) =>{
        const changes = handleTrackChangedFields(operations_data, data);
        if(!changes){
            setItem(CACHE_KEY, "touched")
            setTouched(true)
            return
        }
        const PAYLOAD:InstanceMutation ={
            url :`/api/companies/${subject_object_id}/`,
            mode : "update",
            data : {
                operations :  changes
            }
        }
        mutate(PAYLOAD, {
            onSuccess : (data: Company) => {
                cache.set(["subject", "operations"], data.operations)
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                toast.success("Company Operations updated successfully.")
                setTouched(true)
      },
            onError : (error) => handleAxiosError(error)
        })
    }


    return { 
        handleSubmit,
        onSubmit,
        getValues,
        register, 
        control,
        isPending,
        errors,
        touched
    }
}

export default useCompanyOperations
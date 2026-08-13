import { handleAxiosError, handleTrackChangedFields, genStorageKey, cleanPayload } from "@/lib/utils";
import { getItem } from "@/lib/storage";
import type { Company, CompanyOperationsProps } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form"
import { toast } from "sonner";
import { z } from "zod"
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import useSectionTouched from "./useSectionTouched";

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
    purchase_supplier_scope : z.enum(["local", "local_and_international", "international"]).optional()    
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
    const {mutate, isPending} = useInstanceMutation()
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "operations_details"), [report_id,subject_type])
    const { onTouched, touched }= useSectionTouched(CACHE_KEY)

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched") onTouched();
    }, [report_id, subject_type, CACHE_KEY, onTouched])

    useEffect(()=>{
        if(operations_data){
            reset(operations_data)
        }
    }, [reset, operations_data])

    const onSubmit = (data: CompanyOperationsFormData) =>{
        const changes = handleTrackChangedFields(operations_data, data);
        if(!changes){
            onTouched();
            return
        }
        
        const PAYLOAD:InstanceMutation ={
            url :`/api/companies/${subject_object_id}/`,
            mode : "update",
            data : {
                operations :  cleanPayload(changes)
            }
        }
        mutate(PAYLOAD, {
            onSuccess : (data: Company) => {
                cache.set(["subject", "operations"], data.operations)
                toast.success("Company Operations updated successfully.")
                onTouched();
      },
            onError : (error) => handleAxiosError(error)
        })
    }


    return { 
        handleSubmit,
        onSubmit,
        getValues,
        register, 
        onTouched,
        control,
        isPending,
        errors,
        touched
    }
}

export default useCompanyOperations
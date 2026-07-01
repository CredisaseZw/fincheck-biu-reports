import { handleAxiosError, handleTrackChangedFields } from "@/lib/utils";
import type { Company, CompanyOperationsProps } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react";
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
    const {mutate, isPending} = useInstanceMutation()
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])


    useEffect(()=>{
        if(operations_data){
            reset(operations_data)
        }
    }, [reset, operations_data])

    const onSubmit = (data: CompanyOperationsFormData) =>{
        console.log("onSubmit data", data)
        console.log("onSubmit operations_data", operations_data)
        const changes = handleTrackChangedFields(operations_data, data);
        if(changes.length === 0){
            toast.info("No changes made")
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
            onSuccess:(data: Company)=>{
                cache.set(["subject", "operations"], data.operations)
                toast.success("Company Operations updated successfully.")
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
        errors 
    }
}

export default useCompanyOperations
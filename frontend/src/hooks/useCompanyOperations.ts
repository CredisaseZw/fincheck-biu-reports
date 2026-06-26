import { handleAxiosError, handleTrackChangedFields } from "@/lib/utils";
import type { CompanyOperationsProps } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react";
import { useForm } from "react-hook-form"
import { toast } from "sonner";
import { z } from "zod"
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";

const companyOperationsSchema = z.object({
    industry: z.string().max(255).optional(),
    target_markets: z.string().optional(),
    operations_territories: z.string().optional(),
    property_ownership: z.string().optional(),
    operational_areas: z.string().optional(),
})

export type CompanyOperationsFormData = z.infer<typeof companyOperationsSchema>

function useCompanyOperations({  
    report_id,
    subject_object_id,
    operations_data,
    subject_type}:CompanyOperationsProps) {
    const {
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
        const changes = handleTrackChangedFields(operations_data, data);
        if(changes.length === 0){
            toast.info("No changes made")
            return
        }
        const PAYLOAD:InstanceMutation ={
            url :`/api/companies/${subject_object_id}/`,
            mode : "update",
            data : {
                operations_data :  changes
            }
        }
        mutate(PAYLOAD, {
            onSuccess:(data)=>{
                cache.set(["subject"], data)
                toast.success("Company Operations updated successfully.")
            },
            onError : (error) => handleAxiosError(error)
        })
    }


    return { 
        handleSubmit,
        onSubmit,
        register, 
        control,
        isPending,
        errors }
}

export default useCompanyOperations
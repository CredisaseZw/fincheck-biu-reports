import { handleAxiosError, handleTrackChangedFields } from "@/lib/utils";
import type { CompanyStructureProps, Report } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod"
import type { InstanceMutation } from "./api/useInstanceMutation";
import useInstanceMutation from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { useEffect } from "react";

const companyStructureSchema = z.object({
    holding_company: z.string().optional(),
    subsidiaries: z.string().optional(),
    associated_companies: z.string().optional(),
    divisions: z.string().optional(),
    branches: z.string().optional(),
})
export type CompanyStructureFormData = z.infer<typeof companyStructureSchema>

function useCompanyStructure({
    report_id,
    subject_object_id,
    structure_data,
    subject_type
}: CompanyStructureProps) {
    const {
        reset,
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<CompanyStructureFormData>({
        resolver: zodResolver(companyStructureSchema),
        defaultValues: structure_data
    })
    const {mutate, isPending} = useInstanceMutation()
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])

    useEffect(()=>{
        if(structure_data){
            reset(structure_data)
        }
    }, [reset, structure_data])

    const onSubmit = (data: CompanyStructureFormData) =>{
        const changes = handleTrackChangedFields(structure_data, data);
        if(changes.length === 0){
            toast.info("No changes made")
            return
        }
        const PAYLOAD:InstanceMutation ={
            url :`/api/companies/${subject_object_id}/`,
            mode : "update",
            data : {
                structure_data :  changes
            }
        }
        mutate(PAYLOAD, {
            onSuccess:(data)=>{
                cache.set(["subject"], data)
                toast.success("Company structure updated successfully.")
            },
            onError : (error) => handleAxiosError(error)
        })
    }

    return {
        handleSubmit,
        register,
        onSubmit,
        control,
        errors,
        isPending
    }
}

export default useCompanyStructure
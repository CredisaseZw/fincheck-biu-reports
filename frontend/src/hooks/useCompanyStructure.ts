import { handleAxiosError, handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { getItem } from "@/lib/storage";
import type { Company, CompanyStructureProps, Report } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod"
import type { InstanceMutation } from "./api/useInstanceMutation";
import useInstanceMutation from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { useEffect, useMemo } from "react";
import useSectionTouched from "./useSectionTouched";
import { useQueryClient } from "@tanstack/react-query";

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
    const client = useQueryClient()
    const {mutate, isPending} = useInstanceMutation()
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "structure_details"), [report_id,subject_type])
    const { onTouched, touched } = useSectionTouched(CACHE_KEY);
    
    useEffect(()=>{
        
        const state = getItem(CACHE_KEY)
        if(state === "touched") onTouched();
    }, [report_id, subject_type, CACHE_KEY, onTouched])

    useEffect(()=>{
        if(structure_data){
            reset(structure_data)
        }
    }, [reset, structure_data])

    const onSubmit = (data: CompanyStructureFormData) =>{
        const changes = handleTrackChangedFields(structure_data, data);
        if(!changes){
            onTouched()
            return
        }
        const PAYLOAD:InstanceMutation ={
            url :`/api/companies/${subject_object_id}/`,
            mode : "update",
            data : {
                structure :  changes
            }
        }
        mutate(PAYLOAD, {
            onSuccess : (data:Company) => {
                client.invalidateQueries({ queryKey: ["company" ]})
                cache.set(["subject","structure"], data.structure)
                toast.success("Company structure updated successfully.")
                if(report_id) onTouched();
            },
            onError : (error) => handleAxiosError(error)
        })
    }

    return {
        handleSubmit,
        register,
        onSubmit,
        onTouched,
        control,
        errors,
        isPending,
        touched
    }
}

export default useCompanyStructure
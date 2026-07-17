import { handleAxiosError, handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { getItem, setItem } from "@/lib/storage";
import type { Company, CompanyStructureProps, Report } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod"
import type { InstanceMutation } from "./api/useInstanceMutation";
import useInstanceMutation from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { useState,  useEffect, useMemo } from "react";

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
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "structure_details"), [report_id,subject_type])
    const [touched, setTouched] = useState(false)

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched"){
            setTouched(true)
        }
    }, [report_id, subject_type, CACHE_KEY])

    useEffect(()=>{
        if(structure_data){
            reset(structure_data)
        }
    }, [reset, structure_data])

    const onSubmit = (data: CompanyStructureFormData) =>{
        const changes = handleTrackChangedFields(structure_data, data);
        if(!changes){
            setItem(CACHE_KEY, "touched")
            setTouched(true)
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
                cache.set(["subject","structure"], data.structure)
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                toast.success("Company structure updated successfully.")
                setTouched(true)
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
        isPending,
        touched
    }
}

export default useCompanyStructure
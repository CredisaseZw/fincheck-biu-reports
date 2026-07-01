import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react";
import { useForm } from "react-hook-form"
import { z } from "zod"
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import { handleAxiosError, handleTrackChangedFields } from "@/lib/utils";
import { toast } from "sonner";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import type { EntityValue, Individual, Report } from "@/types/core";

const EmploymentStatus = z.enum(["employed", "self_employed", "unemployed", "part_time", "retired", "student"])
const employmentSchema = z.object({
    individual_id: z.number().optional(),
    employer: z.string().max(255).optional(),
    position: z.string().max(255).optional(),
    employment_status: EmploymentStatus.optional(),
    years_employed: z.number().int().positive().optional(),
    monthly_income: z.number().optional(),
    previous_employer: z.string().max(255).optional(),
})

export type EmploymentFormData = z.infer<typeof employmentSchema>
interface props {
    subject_type : EntityValue | null
    employment_information: EmploymentFormData | undefined,
    report_id : number | undefined
}
function useEmploymentInformation({employment_information, report_id, subject_type }:props) {
    const {mutate, isPending} = useInstanceMutation()
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])

    const {
        reset,
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<EmploymentFormData>({
        resolver: zodResolver(employmentSchema),
        defaultValues: employment_information,
    })

    useEffect(()=>{
        if(employment_information){
            reset(employment_information)
        }
    }, [reset, employment_information])

    const onSubmit = (data: EmploymentFormData) => {
        if(!employment_information){
            toast.error("An error occurred", {
                description : "An individual instance is required"
            })
            return;
        }
        const { individual_id, ...init }= employment_information
        delete data.individual_id;

        const PAYLOAD: InstanceMutation = {
            url: `/api/individuals/${individual_id}/`,
            mode: "update",
        }
        
        const changes = handleTrackChangedFields(init, data);
        if (!changes) return;
        PAYLOAD.data = { employment_information: changes }
    
        mutate(PAYLOAD, {
            onSuccess: (data: Individual) => {
                cache.set(["subject", "employment_information"], data.employment_information)
                toast.success("Information successfully updated")
            },
            onError: (error) => handleAxiosError(error)
        })
    }

    return { 
        onSubmit,
        register, 
        handleSubmit, 
        errors, 
        control,
        isPending
    }
}

export default useEmploymentInformation
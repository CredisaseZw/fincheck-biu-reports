import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react";
import { useForm } from "react-hook-form"
import { z } from "zod"
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import { handleTrackChangedFields } from "@/lib/utils";

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

function useEmploymentInformation(employment_information: EmploymentFormData | undefined) {
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

    const {mutate, isPending} = useInstanceMutation()

    useEffect(()=>{
        if(employment_information){
            reset(employment_information)
        }
    }, [reset, employment_information])

    const onSubmit = (data: EmploymentFormData) =>{
        delete data.individual_id;
        const PAYLOAD: InstanceMutation = {
            url : "",
            mode :"create",
        }

        if(!employment_information){
            PAYLOAD.url = "/api/individuals/"
            PAYLOAD.data = data
        } else {
            const { individual_id, ...initial_data } = data;
            const changes = handleTrackChangedFields(initial_data, data),
            if(!changes) return;

            PAYLOAD.url = `/api/individuals/${individual_id}/`
            PAYLOAD.mode = "update"
            PAYLOAD.data = changes
        }
    }
    return { 
        onSubmit,
        register, 
        handleSubmit, 
        errors, 
        control }
}

export default useEmploymentInformation
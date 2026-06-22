import { ADDRESS_OBJECT } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react";
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { InstanceMutation } from "./api/useInstanceMutation";
import { cleanPayload, formatAddressToString, handleAxiosError, handleTrackChangedFields } from "@/lib/utils";
import useInstanceMutation from "./api/useInstanceMutation";
import { toast } from "sonner";

const MaritalStatus = z.enum(["single", "married", "divorced", "widowed"], {message : "Marital Status is required"})

export const individualSchema = z.object({
    id: z.number().optional(),
    full_name: z.string().min(1, "Full name is required").max(255),
    national_id: z.string().min(1, "National ID / Passport is required").max(100),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    gender: z.string().min(1, "Gender is required").max(50),
    marital_status: MaritalStatus.optional(),
    nationality: z.string().min(1, "Nationality is required").max(100),
    mobile_number: z.string().min(1, "Mobile number is required").max(50),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    residential_address: ADDRESS_OBJECT,
})

export type IndividualFormData = z.infer<typeof individualSchema>

function useIndividualDetails(individual_details: IndividualFormData | undefined) {
    const {mutate, isPending} = useInstanceMutation()
    const {
        control,
        reset,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IndividualFormData>({
        resolver: zodResolver(individualSchema),
        defaultValues: individual_details
    })

    useEffect(()=>{
        if(individual_details){
            reset(individual_details)
        }
    }, [individual_details, reset])

    const onSubmit = (data: IndividualFormData) => {
        delete data.id;
        const PAYLOAD:InstanceMutation = {
            url :"",
            mode : "create"
        }

        if(!individual_details){
            const DATA:any = cleanPayload(data)
            if(DATA.residential_address){
                DATA.residential_address = formatAddressToString(DATA.residential_address)
            }
            PAYLOAD.url = "/api/individuals/"
            PAYLOAD.data = DATA
        } else{
            const {id, ...initial_data} = individual_details;
            const changes = handleTrackChangedFields(initial_data, data);
            if(!changes) return;

            if (changes.residential_address){
                changes.residential_address = formatAddressToString(data.residential_address)
            }

            PAYLOAD.url = `/api/individuals/${id}/`
            PAYLOAD.mode = "update"
            PAYLOAD.data = changes
        }

        console.log(PAYLOAD)
        mutate(PAYLOAD, {
            onSuccess : (data) =>{
                console.log(data) // return Individual as a whole
                toast.success("Information successfully updated")
            },
            onError: (error) => handleAxiosError(error)
        })
    }

    return { 
        errors,
        control, 
        isPending,
        handleSubmit,
        onSubmit,
        register,
    }
}

export default useIndividualDetails
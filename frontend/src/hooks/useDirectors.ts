import {useForm, useFieldArray} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"
import type { CompanyDirectorsProps, Report } from "@/types/core";
import { useEffect } from "react";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import { handleAxiosError, handleTrackChangedArray } from "@/lib/utils";
import { toast } from "sonner";

const Positions = z.enum(["director", "secretary", "other"])
const Genders = z.enum(["male", "female"])

const director = z.object({
    id : z.number().optional(),
    full_name : z.string().min(1,"A valid name is required"),
    position: Positions,
    gender : Genders,
    dob : z.string().optional(),
    address_latest : z.string(),
    address_prev : z.string().optional(),
    national_id : z.string().refine((val) => {
        if (!val) return true
        const nidRegex = /^\d{2}\d{6,7}[A-Za-z]\d{2}$/
        const passportRegex =/^[A-Za-z]{2}\d{7}$/
        return nidRegex.test(val) || passportRegex.test(val)
    }, { message: "A valid Zimbabwe national ID or passport number is required" }),
    email : z.string().email("A valid email is required"),
    mobile_phone_number :z.string().optional(),
    insolvencies_judgements : z.string().optional()
})
const schema = z.object({ directors : z.array(director) })

export type DirectorFormData = z.infer<typeof director>;
type DirectorsFormData = z.infer<typeof schema>;

function useDirectors({
    directors_data,
    subject_object_id,
    subject_type,
    report_id
}:CompanyDirectorsProps) {
    const {
        reset,
        register,
        getValues,
        handleSubmit, 
        control,
        formState : {errors}
    } = useForm<DirectorsFormData>({
        resolver :zodResolver(schema),
        defaultValues : {
            directors : directors_data
        }
    })

    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const { mutate, isPending } = useInstanceMutation();

    useEffect(()=>{
        if(directors_data){
            reset({
                directors : directors_data
            })
        }
    }, [reset, directors_data])

    const {append, remove, fields} = useFieldArray({
        control,
        name  :"directors"
    })

    const onSubmit = (data : DirectorsFormData) => {
        const changes = handleTrackChangedArray(directors_data, data.directors)
        if(changes.length === 0){
            toast.warning("No changes made.")
            return
        }

        const payload:InstanceMutation = {
            url : `/api/companies/${subject_object_id}/directors/`,
            mode : "create",
            data :{ directors : changes }
        }

        mutate(payload,{
            onSuccess : (data) =>{
                cache.set(["subject", "directors"], data)
                toast.success("Directors successfully updated")
            },
            onError: (e) => handleAxiosError(e)
        })
    }

    const onDelete = (id: number) =>{
        mutate({
            url : `/api/directors/${id}/`,
            mode : "deletion"
        }, {
            onSuccess : () =>{
                cache.removeFromList(["subject", "directors"], id)
                toast.success("Directors successfully removed.")
            },
            onError: (e) => handleAxiosError(e)})
    }

    return {
        handleSubmit,
        onSubmit,
        append,
        register,
        remove,
        onDelete,
        getValues,
        errors,
        control,
        fields,
        isPending
    }
}

export default useDirectors
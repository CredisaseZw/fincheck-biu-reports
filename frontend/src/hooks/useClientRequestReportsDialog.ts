import type { SearchEntityRef } from "@/components/general/SearchEntity";
import { DEBTOR_TYPE } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import useInstanceMutation from "./api/useInstanceMutation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";

const row = z.object({
    subject_type : DEBTOR_TYPE,
    subject_object_id : z.number("A valid subject object id is required").positive("A valid subject object id is required"),
    contact_person: z.string().optional()
})
const schema = z.object({
    requestor:z.string().min(1, "Requestor name is required"),
    rows : z.array(row)
})
export type ClientRequestFormData = z.infer<typeof schema>;

function useClientRequestReportsDialog() {
    const {
        formState :{ errors },
        control,
        register,
        setValue,
        getValues,
        watch,
        handleSubmit,
        reset
    } = useForm({
        resolver : zodResolver(schema),
        defaultValues : {
            requestor : "",
            rows:[{ subject_type : "company" },
                { subject_type : "company" },
                { subject_type : "company" }]      
        }
    })  
    const [open, setOpen] =useState(false);
    const queryClient = useQueryClient();
    const {mutate, isPending} = useInstanceMutation();
    const refs = useRef<(SearchEntityRef | null)[]>([])
    const {fields, append, remove} = useFieldArray({
        control,
        name :"rows"
    })

    const onSubmit = (data: ClientRequestFormData) =>{
        mutate({
            url: "/api/reports/request-report/",
            mode: "create",
            data,
        }, {
            onSuccess : () =>{
                toast.success("Report successfully requested.")
                setOpen(false)
                reset({
                    requestor : "",
                    rows : [{ subject_type : "company" },
                    { subject_type : "company" },
                    { subject_type : "company" }]
                })
                queryClient.invalidateQueries({
                    queryKey : ["reports"]
                })
            },
            onError : (error) => handleAxiosError(error)            
        })
    }

    return {
        control,
        errors,
        fields, 
        refs,
        open,
        isPending,
        setOpen,
        register,
        onSubmit,
        setValue,
        getValues,
        watch,
        handleSubmit,
        append,
        remove
    }
}

export default useClientRequestReportsDialog
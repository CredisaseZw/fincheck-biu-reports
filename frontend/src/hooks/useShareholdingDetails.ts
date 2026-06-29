import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { CompanyShareholdingProps, Report } from "@/types/core";
import { useEffect } from "react";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import { handleAxiosError, handleTrackChangedArray, handleTrackChangedFields } from "@/lib/utils";
import { toast } from "sonner";

const schema = z.object({
    id : z.number().optional(),
    numbers_of_shares : z.number("Enter a valid number of shares").positive("Positive numbers required"),
    numbers_of_shareholders : z.number("Enter a valid number of shareholders").positive("Positive numbers required"),
    shareholders : z.array(
        z.object({
            id : z.number().optional(),
            full_name : z.string(),
            address : z.string(),
            number_of_shares : z.number("Enter a valid number of shares").positive("Positive numbers required"),
            percentage_ownership : z.number("Enter a valid percentage")
            .min(0, "Min value is 0")
            .max(100, "Max value is 100")
            .positive("Positive numbers required")
        })
   )
})

export type ShareholdingsFormData = z.infer<typeof schema>;

function useShareholdingDetails({
    subject_object_id,
    subject_type,
    report_id,
    shareholdings_data
}: CompanyShareholdingProps) {
    const {
        reset,
        register,
        getValues,
        handleSubmit,
        control,
        formState : { errors }
    } = useForm({
        resolver : zodResolver(schema),
        defaultValues : shareholdings_data
    })
    useEffect(()=>{
        if(shareholdings_data){
            reset(shareholdings_data)
        }
    }, [reset, shareholdings_data])

    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const {mutate, isPending} = useInstanceMutation()

    const {fields, append, remove} = useFieldArray({
        control,
        name : "shareholders"
    })

    const onSubmit = (data: ShareholdingsFormData) =>{
        const {shareholders : currentShareholders, ...currentData } = data
        const {shareholders : initShareholders, ...initData } = shareholdings_data ?? {}
        
        const topLevelChanges = handleTrackChangedFields(initData, currentData);
        const shareholderChanges = handleTrackChangedArray(initShareholders ?? [{}], currentShareholders);

        if (!topLevelChanges && shareholderChanges.length === 0){
            toast.info("No changes made.")
            return;
        }

        const payload:InstanceMutation  = {
            url: `/api/companies/${subject_object_id}/shareholders/`,
            mode : "create",
            data : {
                ...topLevelChanges, 
                id : data.id,
                shareholders : shareholderChanges
            }
        }
        mutate(payload, {
            onSuccess : (data_)=>{
                toast.success("Shareholders successfully updated.")
                cache.set(["subject", "shareholdings"], data_)
            },
            onError : (e)=> handleAxiosError(e)
        })
    }

    const onDelete =(id: number) =>{
        mutate({
            url : `/api/shareholders/${id}/`,
            mode : "deletion"
        }, {
            onSuccess : ()=>{
                toast.success("Shareholder successfully removed.")
                cache.removeFromList(["subject", "shareholdings", "shareholders"], id)
            },
            onError : (e) => handleAxiosError(e)
        })
    }

    return {
        isPending,
        errors,
        fields, 
        getValues,
        append, 
        remove,
        register,
        handleSubmit,
        onSubmit,
        onDelete
    }
}

export default useShareholdingDetails
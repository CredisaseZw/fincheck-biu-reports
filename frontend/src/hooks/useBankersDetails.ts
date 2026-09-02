import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { BankerDetailsProps, Company, Individual, Report } from "@/types/core";
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import {  useEffect, useMemo } from "react";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { toast } from "sonner";
import { handleAxiosError, handleTrackChangedArray, genStorageKey } from "@/lib/utils";
import { getItem } from "@/lib/storage";
import useSectionTouched from "./useSectionTouched";

const AccountTypes = z.enum(["current", "savings", "loan", "fixed_deposit", "none"])
const Narrations = z.enum(["A", "B", "C", "D", "E", "none"])

const accountSchema = z.object({
    id: z.number().optional(),
    bank: z.string().optional(),
    branch: z.string().optional(),
    account_name: z.string().optional(),
    account_type: AccountTypes.optional(),
    account_number: z.string().optional(),
    date_of_acquirement: z.string().date().optional(),
    bank_code_narration: Narrations.optional(),
    currency: z.string().optional(),
})

const schema = z.object({ accounts: z.array(accountSchema) })

export type BankerAccountFormData = z.infer<typeof accountSchema>
type BankerDetailsFormData = z.infer<typeof schema>

function useBankersDetails({
    subject_object_id,
    subject_type,
    report_id,
    banker_accounts
}:BankerDetailsProps) {
    const {
        getValues,
        register,
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm<BankerDetailsFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            accounts: [],
        },
    })

    useEffect(()=>{
        if(banker_accounts){
            reset({
                accounts: banker_accounts
            })
        }
    }, [reset, banker_accounts])

    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "banker_details"), [report_id,subject_type])
    const { mutate, isPending } = useInstanceMutation()
    const { onTouched, touched } = useSectionTouched(CACHE_KEY);

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched") onTouched();
    }, [report_id, subject_type, CACHE_KEY, onTouched])

    const { fields, append, remove } = useFieldArray({
        control,
        name: "accounts",
    })

    const onSubmit = (data:BankerDetailsFormData)=>{
        const accountNumbers = new Set<string>();
        for (const account of data.accounts) {
            const accNum = account.account_number?.trim().toLowerCase();
            if (accNum) {
                if (accountNumbers.has(accNum)) {
                    toast.error(`Duplicate Account Number detected: ${account.account_number}`);
                    return;
                }
                accountNumbers.add(accNum);
            }
        }

        const changes = handleTrackChangedArray(banker_accounts, data.accounts)
        if(changes.length === 0){
            onTouched();
            return
        }
        const PAYLOAD:InstanceMutation ={
            url : subject_type === "company"
            ? `/api/companies/${subject_object_id}/`
            : `/api/individuals/${subject_object_id}/`,
            mode : "update",
            data : {
                banker_accounts :  changes
            }
        }
        mutate(PAYLOAD, {
            onSuccess : (data: Company | Individual) => {
                cache.set(["subject", "banker_accounts"], data.banker_accounts)
                toast.success("Banker accounts Updated successfully.")     
                onTouched();
            },
            onError : (error) => handleAxiosError(error)
        })
    }   

    const onDelete = (id:number)=>{
        mutate({
           url : `/api/bankers_accounts/${id}/`,
           mode :"deletion" 
        }, {
            onSuccess : () => {
                cache.removeFromList(["subject", "banker_accounts"], id)
                toast.success("Banker row successfully deleted.")
                onTouched();
            },
            onError :(e)=>handleAxiosError(e)
        })
    }

    return {
        onDelete,
        onSubmit,
        append,
        remove,
        getValues,
        register,
        handleSubmit,
        onTouched,
        control,
        isPending,
        errors,
        fields,
        touched
    }
}

export default useBankersDetails
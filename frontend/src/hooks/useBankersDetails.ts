import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CURRENCY } from "@/constants"
import type { BankerDetailsProps, Company, Individual, Report } from "@/types/core";
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import { useState,  useEffect } from "react";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { toast } from "sonner";
import { handleAxiosError, handleTrackChangedArray } from "@/lib/utils";

const AccountTypes = z.enum(["current", "savings", "loan", "fixed_deposit"])
const Narrations = z.enum(["A", "B", "C", "D", "E"])

const accountSchema = z.object({
    id: z.number().optional(),
    bank: z.string(),
    branch: z.string().optional(),
    account_name: z.string(),
    account_type: AccountTypes,
    account_currency: CURRENCY,
    account_number: z.string(),
    date_of_acquirement: z.string().date(),
    bank_code: z.string(),
    narration: Narrations,
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
            accounts: [
                
            ],
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
    const { mutate, isPending } = useInstanceMutation()
    const [touched, setTouched] = useState(false)
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
            toast.info("No changes made")
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
                setTouched(true)
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
                setTouched(true)
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
        control,
        isPending,
        errors,
        fields,
        touched
    }
}

export default useBankersDetails
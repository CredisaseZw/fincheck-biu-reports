import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Company, CompanyShareholdingProps, Report, Shareholding } from "@/types/core";
import { useState,  useEffect, useMemo } from "react";
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import { handleAxiosError, handleTrackChangedArray, handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { getItem, setItem } from "@/lib/storage";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
    id: z.number().optional(),
    issued_share_capital: z.number().optional(),
    numbers_of_shareholders: z.number("Enter a valid number of shareholders").positive("Positive numbers required"),
    authorized_capital: z.number().optional(),
    shareholders: z.array(
        z.object({
            id: z.number().optional(),
            full_name: z.string(),
            address: z.string(),
            is_pep: z.boolean(),
            number_of_shares: z.number("Enter a valid number of shares").positive("Positive numbers required"),
            percentage_ownership: z.number("Enter a valid percentage")
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
        formState: { errors }
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: shareholdings_data
    })

    useEffect(() => {
        if(shareholdings_data){
            reset({
                id: shareholdings_data.id,
                issued_share_capital : shareholdings_data.issued_share_capital,
                numbers_of_shareholders: shareholdings_data.numbers_of_shareholders,
                authorized_capital : shareholdings_data.authorized_capital,
                shareholders: shareholdings_data.shareholders.map(item => ({
                    id: item.id,
                    full_name: item.full_name,
                    address  :item.address,
                    is_pep: item.is_pep,
                    number_of_shares :item.number_of_shares,
                    percentage_ownership :item.percentage_ownership
                }))
            })
        }
    }, [reset, shareholdings_data]);

    const client = useQueryClient()
    const { mutate, isPending } = useInstanceMutation()
    const [touched, setTouched] = useState(false)
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "shareholding_details"), [report_id,subject_type])

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched"){
            setTouched(true)
        }
    }, [report_id, subject_type, CACHE_KEY])

    const { fields, append, remove } = useFieldArray({
        control,
        name: "shareholders"
    })

    const onSubmit = (data: ShareholdingsFormData) => {
        if (isPending) return;

        const { shareholders: currentShareholders, ...currentData } = data
        const { shareholders: initShareholders, ...initData } = shareholdings_data ?? {}

        const topLevelChanges = handleTrackChangedFields(initData, currentData);
        const shareholderChanges = handleTrackChangedArray(initShareholders ?? [], currentShareholders);

        if (!topLevelChanges && shareholderChanges.length === 0) {
            setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
            setTouched(true)
            return;
        }

        const payload: InstanceMutation = {
            url: `/api/companies/${subject_object_id}/shareholders/`,
            mode: "create",
            data: {
                ...topLevelChanges,
                shareholders: shareholderChanges,
                ...(data.id ? { id: data.id } : {})
            }
        }

        mutate(payload, {
            onSuccess: (data_: Shareholding) => {
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                toast.success("Shareholders successfully updated.")

                client.setQueryData<Report>(
                    ["report", subject_type, report_id],
                    (old) => {
                        if (!old || !old.subject) return old
                        const subject = old.subject as Company
                        return {
                            ...old,
                            subject: {
                                ...subject,
                                shareholdings: data_,
                            },
                        }
                    }
                )

                setTouched(true)

                reset({
                    id: data_.id,
                    issued_share_capital :  Number(data_.issued_share_capital),
                    numbers_of_shareholders: data_.numbers_of_shareholders,
                    authorized_capital: Number(data_.authorized_capital),
                    shareholders: data_.shareholders.map(item => ({
                        id: item.id ?? undefined,
                        full_name: item.full_name,
                        address: item.address,
                        is_pep: item.is_pep,
                        number_of_shares: item.number_of_shares,
                        percentage_ownership: Number(item.percentage_ownership)
                    }))
                })
            },
            onError: (e) => handleAxiosError(e)
        })
    }

   const onDelete = (id: number) => {
        mutate({
            url: `/api/shareholders/${id}/`,
            mode: "deletion"
        }, {
            onSuccess: () => {
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                toast.success("Shareholder successfully removed.")
                client.setQueryData<Report>(
                    ["report", subject_type, report_id],
                    (old) => {
                        if (!old || !old.subject) return old
                        const subject = old.subject as Company
                        return {
                            ...old,
                            subject: {
                                ...subject,
                                shareholdings: subject.shareholdings ? {
                                    ...subject.shareholdings,
                                    shareholders: subject.shareholdings.shareholders?.filter(
                                        (s) => s.id !== id
                                    ),
                                } : subject.shareholdings,
                            },
                        }
                    }
                )
                setTouched(true)
            },
            onError: (e) => handleAxiosError(e)
        })
    }

    return {
        touched,
        isPending,
        errors,
        fields,
        control,
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
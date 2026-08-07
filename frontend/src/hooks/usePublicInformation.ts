import { genStorageKey, handleAxiosError, handleTrackChangedArray } from "@/lib/utils";
import type { PublicInformationProps, Report } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod";
import {  useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod"
import type { InstanceMutation } from "./api/useInstanceMutation";
import useInstanceMutation from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { getItem } from "@/lib/storage";
import useSectionTouched from "./useSectionTouched";

const schema = z.object({
    id: z.number().optional(),
    record_date :z.string().min(1, "Record Date is required"),
    summary: z.string().min(1, "Summary is required"),
    link: z.string()
    .refine(
        val => !val || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(val),
        "Invalid URL"
    )
    .optional(),
})

const publicInformationSchema = z.object({
    public_information: z.array(schema)
})

export type PublicInformationFormData = z.infer<typeof schema>
type PublicInformationFormDataList = z.infer<typeof publicInformationSchema>

function usePublicInformation({
    public_information_data,
    subject_object_id,
    subject_type,
    report_id
}: PublicInformationProps) {
    const {
        reset,
        register,
        getValues,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm<PublicInformationFormDataList>({
        resolver: zodResolver(publicInformationSchema),
        defaultValues: {
            public_information: public_information_data,
        },
        resetOptions : { keepDirtyValues : true }
    })

    const { isPending, mutate } = useInstanceMutation()
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "public_information"), [report_id,subject_type])
    const {onTouched, touched} = useSectionTouched(CACHE_KEY);

    useEffect(() => {
        if (public_information_data) {
            reset({
                public_information: public_information_data
            })
        }
    }, [reset, public_information_data])

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched") onTouched();
    }, [report_id, subject_type, CACHE_KEY, onTouched])

    const { fields, append, remove } = useFieldArray({
        control,
        name: "public_information"
    })

    const onSubmit = (data: PublicInformationFormDataList) => {
        if (!subject_object_id || !subject_type) {
            toast.error("No working report loaded.")
            return;
        }
        const changes = handleTrackChangedArray(public_information_data, data.public_information)
        if (changes.length === 0) {
            onTouched()
            return
        }
        const payload: InstanceMutation = {
            url: "/api/credit-records/public-information/",
            mode: "update",
            data: {
                subject_object_id,
                subject_type,
                public_information: changes
            }
        }

        mutate(payload, {
            onSuccess : (data) => {
                cache.set(["subject", "public_information"], data.public_information)
                toast.success("Public information updated successfully")
                onTouched()
            },
            onError: (error) => handleAxiosError(error)
        })
    }

    const onDelete = (id: number) => {
        mutate({
            url: `/api/credit-records/public_information/${id}/`,
            mode: "deletion"
        }, {
            onSuccess : () => {
                cache.removeFromList(["subject", "public_information"], id)
                toast.success("Public information row deleted successfully")
                onTouched();
      },
            onError: (error) => handleAxiosError(error)
        })
    }

    return {
        control,
        touched,
        errors,
        fields,
        isPending,
        append,
        onTouched,
        onDelete,
        register,
        handleSubmit,
        remove,
        onSubmit,
        getValues
    }
}

export default usePublicInformation

import { handleAxiosError, handleTrackChangedArray } from "@/lib/utils";
import type { PublicInformationProps, Report } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState,  useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod"
import type { InstanceMutation } from "./api/useInstanceMutation";
import useInstanceMutation from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";

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
            public_information: public_information_data
        }
    })

    const { mutate, isPending } = useInstanceMutation()
  const [touched, setTouched] = useState(false)
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])

    useEffect(() => {
        if (public_information_data) {
            reset({
                public_information: public_information_data
            })
        }
    }, [reset, public_information_data])

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
            toast.info("No changes made")
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
                setTouched(true)
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
                setTouched(true)
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
        onDelete,
        register,
        handleSubmit,
        remove,
        onSubmit,
        getValues
    }
}

export default usePublicInformation

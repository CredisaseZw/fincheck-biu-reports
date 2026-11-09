import {useForm, useFieldArray, useWatch} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"
import type { CompanyDirectorsProps, Report } from "@/types/core";
import {  useEffect, useMemo } from "react";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import { handleAxiosError, handleTrackChangedArray, genStorageKey, handleTrackChangedFields } from "@/lib/utils";
import { getItem } from "@/lib/storage";
import { toast } from "sonner";
import { GENDERS } from "@/constants";
import useSectionTouched from "./useSectionTouched";
import { useQueryClient } from "@tanstack/react-query";

const Positions = z.enum(["director", "secretary", "chairman","other"])

const director = z.object({
    id : z.number().optional(),
    director_id: z.number().optional(),
    full_name : z.string().min(1,"A valid name is required"),
    position: Positions,
    gender : GENDERS,
    date_of_birth : z.string().optional(),
    residential_address : z.string(),
    is_pep : z.boolean(),
    address_prev : z.string().optional(),
    national_id: z.string().optional(),
    email : z.string().optional(),
    mobile_number :z.string().optional(),
    insolvencies_judgements : z.string().optional(),
    external_directors: z.string().optional(),
    date_of_appointment : z.string().optional(),
    other_individual_directorships : z.array(z.string()).optional(),
})

const schema = z.object({ 
    directors : z.array(director),
    company_company_secretary : z.object({
        company : z.number().optional(),
        secretary : z.number().optional(),
        secretary_name: z.string().optional(),
        date_of_appointment : z.string().optional(),
    }).optional()
 })

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
        setValue,
        watch,
        handleSubmit, 
        control,
        formState : { errors }
    } = useForm<DirectorsFormData>({
        resolver :zodResolver(schema),
        defaultValues : {
            directors: directors_data?.directors ?? [],
            company_company_secretary : directors_data?.company_company_secretary ?? undefined
        }
    })
    const default_search = useWatch({control, name:"company_company_secretary.secretary_name"});
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const queryClient = useQueryClient()
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "directors_details"), [report_id,subject_type])
    const { mutate, isPending } = useInstanceMutation()
    const {onTouched, touched} = useSectionTouched(CACHE_KEY);

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched") onTouched();
    }, [report_id, subject_type, CACHE_KEY, onTouched])

    useEffect(()=>{
        if(directors_data){
            reset({
            directors: directors_data?.directors ?? [],
            company_company_secretary : directors_data?.company_company_secretary ?? undefined            })
        }
    }, [reset, directors_data])

    const {append, remove, fields} = useFieldArray({
        control,
        name  : "directors"
    })

    const onSubmit = (data: DirectorsFormData) => {
        const changes = handleTrackChangedArray(
            directors_data?.directors ?? [],
            data.directors
        )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ director_id, ...rest }) => rest)

        const current_secretary = data.company_company_secretary && {
            ...data.company_company_secretary,
            date_of_appointment: data.company_company_secretary.date_of_appointment || undefined,
        }

        const secretary_changes = handleTrackChangedFields(
            directors_data?.company_company_secretary,
            current_secretary
        )

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { secretary_name, ...secretary_payload } = secretary_changes ?? {}

        const hasDirectorChanges = changes.length > 0
        const hasSecretaryChange = Object.keys(secretary_payload).length > 0

        if (!hasDirectorChanges && !hasSecretaryChange) {
            onTouched()
            return
        }

        if (
            hasSecretaryChange &&
            !secretary_payload.secretary &&
            secretary_payload.date_of_appointment
        ) {
            toast.error("Please select a valid secretary before submitting.")
            return
        }

        const payload: InstanceMutation = {
            url: `/api/companies/${subject_object_id}/directors/`,
            mode: "create",
            data: {
                directors: changes,
                ...(hasSecretaryChange && { secretary: secretary_payload }),
            },
        }

        mutate(payload, {
            onSuccess: (res) => {
                cache.set(["subject", "directors"], res.directors)
                cache.set(["subject", "company_company_secretary"], res.company_company_secretary ?? null)
                toast.success("Directors successfully updated")
                onTouched()
            },
            onError: (e) => handleAxiosError(e),
        })
    }

    const onDelete = (director_id: number) =>{
        mutate({
            url : `/api/directors/${director_id}/`,
            mode : "deletion"
        }, {
            onSuccess : () => {
                queryClient.setQueryData<Report>(["report", subject_type, report_id], (old) => {
                    if (!old || !old.subject) return old;
                    const subject = old.subject as any;
                    return {
                        ...old,
                        subject: {
                            ...subject,
                            company_company_secretary : subject.company_company_secretary,
                            directors: (subject.directors ?? []).filter((d: any) => d.id !== director_id)
                        }
                    };
                });
                toast.success("Directors successfully removed.")
                onTouched();
            },
            onError: (e) => handleAxiosError(e)})
    }

    return {
        handleSubmit,
        onSubmit,
        append,
        register,
        onTouched,
        remove,
        onDelete,
        getValues,
        setValue,
        watch,
        default_search,
        errors,
        control,
        fields,
        isPending,
        touched,
    }
}

export default useDirectors
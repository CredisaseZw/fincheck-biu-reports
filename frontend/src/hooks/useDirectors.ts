import {useForm, useFieldArray} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"
import type { CompanyDirectorsProps, Report } from "@/types/core";
import {  useEffect, useMemo } from "react";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import { handleAxiosError, handleTrackChangedArray, genStorageKey } from "@/lib/utils";
import { getItem } from "@/lib/storage";
import { toast } from "sonner";
import { GENDERS } from "@/constants";
import useSectionTouched from "./useSectionTouched";

const Positions = z.enum(["director", "secretary", "chairman","other"])
const director = z.object({
    id : z.number().optional(),
    full_name : z.string().min(1,"A valid name is required"),
    position: Positions,
    gender : GENDERS,
    dob : z.string().optional(),
    residential_address : z.string(),
    is_pep : z.boolean(),
    address_prev : z.string().optional(),
    national_id: z.string().optional(),
    email : z.string().optional(),
    mobile_number :z.string().optional(),
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
        setValue,
        watch,
        handleSubmit, 
        control,
        formState : { errors }
    } = useForm<DirectorsFormData>({
        resolver :zodResolver(schema),
        defaultValues : {
            directors : directors_data
        }
    })

    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
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
                directors : directors_data
            })
        }
    }, [reset, directors_data])

    const {append, remove, fields} = useFieldArray({
        control,
        name  :"directors"
    })

    const onSubmit = (data : DirectorsFormData) => {
        const nationalIds = new Set<string>();
        const emails = new Set<string>();

        for (const dir of data.directors) {
            const nid = dir.national_id?.trim().toLowerCase();
            const email = dir.email?.trim().toLowerCase();

            if (nid) {
                if (nationalIds.has(nid)) {
                    toast.error(`Duplicate National ID/Passport detected: ${dir.national_id}`);
                    return;
                }
                nationalIds.add(nid);
            }

            if (email) {
                if (emails.has(email)) {
                    toast.error(`Duplicate Email detected: ${dir.email}`);
                    return;
                }
                emails.add(email);
            }
        }

        const changes = handleTrackChangedArray(directors_data, data.directors)
        if(changes.length === 0){
            onTouched();
            return
        }
        const payload:InstanceMutation = {
            url : `/api/companies/${subject_object_id}/directors/`,
            mode : "create",
            data :{ directors : changes }
        }

        mutate(payload,{
            onSuccess : (data) => {
                cache.set(["subject", "directors"], data.directors)
                toast.success("Directors successfully updated")
                onTouched()
            },
            onError: (e) => handleAxiosError(e)
        })
    }

    const onDelete = (id: number) =>{
        mutate({
            url : `/api/directors/${id}/`,
            mode : "deletion"
        }, {
            onSuccess : () => {
                cache.removeFromList(["subject", "directors"], id)
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
        errors,
        control,
        fields,
        isPending,
        touched,
    }
}

export default useDirectors
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ACCEPTED_TYPES, MAX_SIZE } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod"
import { useState,  useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { file_api } from "@/axios/api"
import { useMutation } from "@tanstack/react-query"
import { handleAxiosError, handleTrackChangedFields, genStorageKey } from "@/lib/utils"
import { getItem, setItem } from "@/lib/storage"
import { toast } from "sonner"
import useDetailCacheUpdate from "./useDetailCacheUpdate"
import type { FinancialsProps, Report } from "@/types/core"

const fileSchema = z.custom<FileList>()
    .refine(
        (files) => !files || files.length === 0 || ACCEPTED_TYPES.includes(files[0]?.type),
        "Only PDF and image files accepted"
    )
    .refine(
        (files) => !files || files.length === 0 || files[0]?.size <= MAX_SIZE,
        "Max file size is 5MB"
    )
    .optional()

const financialsSchema = z.object({
    id: z.number().optional(),
    total_assets: z.number().optional(),
    net_profit: z.string().optional(),
    net_worth: z.string().optional(),
    total_revenue: z.string().optional(),
    asset_ratio : z.number().optional(),
    financial_year: z.number().int().positive().min(2000).max(new Date().getFullYear()),
    financials_file: fileSchema,
    default_file :z.string().optional()
})

export type FinancialEntryFormData = z.infer<typeof financialsSchema>

export const numericField = { setValueAs: (v: string) => v === "" ? undefined : Number(v) }

function useFinancialsDetails({
    financials_data,
    subject_object_id,
    subject_type,
    report_id,
}: FinancialsProps) {
    const {
        register,
        handleSubmit,
        watch,
        reset,
        control,
        formState: { errors },
    } = useForm<FinancialEntryFormData>({
        resolver: zodResolver(financialsSchema),
        defaultValues: financials_data ?? undefined
    })

    useEffect(() => {
        if (financials_data) {
            reset(financials_data)
        }
    }, [reset, financials_data])

    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "financials_details"), [report_id,subject_type])
    const [touched, setTouched] = useState(false);
    
    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched"){
            setTouched(true)
        }
    }, [report_id, subject_type, CACHE_KEY])
    
    const { mutate: save, isPending } = useMutation({
        mutationFn: async (formData: FormData) => {
            const id = formData.get("__id")
            formData.delete("__id")
            if (id) {
                const res = await file_api.patch(`/api/financials/${id}/`, formData)
                return { data: res.data, id: Number(id) }
            }
            const res = await file_api.post(`/api/financials/`, formData)
            return { data: res.data, id: null }
        }
    })

     const buildFormData = (
        entry: Partial<FinancialEntryFormData>,
    ): FormData => {
        const formData = new FormData()

        formData.append("subject_object_id", String(subject_object_id))
        formData.append("subject_type", subject_type!)

        if (entry.id) {
            formData.append("__id", String(entry.id))
        }

        const numericKeys = [
            "total_assets", "asset_ratio", "financial_year"
        ] as const

        const stringKeys = [
            "net_profit", "net_worth", "total_revenue"
        ] as const

        numericKeys.forEach((key) => {
            if (key in entry) {
                const val = entry[key]
                if (val !== undefined && val !== null && !isNaN(val as any)) {
                    formData.append(key, String(val))
                } else if (entry.id) {
                    formData.append(key, "")
                }
            }
        })

        stringKeys.forEach((key) => {
            if (key in entry) {
                const val = entry[key]
                if (val !== undefined && val !== null && val !== "") {
                    formData.append(key, String(val))
                } else if (entry.id) {
                    formData.append(key, "")
                }
            }
        })

        if (entry.financials_file instanceof FileList && entry.financials_file.length > 0) {
            formData.append("financials_file", entry.financials_file[0])
        }

        return formData
    }
    const onSubmit = (data: FinancialEntryFormData) => {
        if (!subject_object_id || !subject_type) {
            toast.error("No working report loaded.")
            return
        }

        let changes: Partial<FinancialEntryFormData> = data;

        if (financials_data && data.id) {
            const { 
                id, 
                financials_file, 
                default_file,
                ...initialData 
            } = financials_data;
            const { 
                id: current_id,
                financials_file: currentFile, 
                default_file: current_default_file,
                ...currentData
            } = data;
            
            const trackedChanges = handleTrackChangedFields(initialData, currentData);
            const hasNewFile = currentFile && currentFile.length > 0;
            
            if (!trackedChanges && !hasNewFile) {
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3);
                setTouched(true);
                return;
            }

            changes = trackedChanges || {};
            changes.id = data.id;
            if (hasNewFile) {
                changes.financials_file = currentFile;
            }
        }

        const formData = buildFormData(changes)
        save(formData, {
            onSuccess : ({ data: savedEntry }) => {
                cache.set(["subject", "financials"], savedEntry)
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                toast.success("Financials updated successfully")
                reset({
                    ...savedEntry,
                    total_assets: savedEntry.total_assets ? Number(savedEntry.total_assets) : undefined,
                    asset_ratio: savedEntry.asset_ratio ? Number(savedEntry.asset_ratio) : undefined,
                    net_profit: savedEntry.net_profit ?? undefined,
                    net_worth: savedEntry.net_worth ?? undefined,
                    total_revenue: savedEntry.total_revenue ?? undefined,
                    paid_up_capital: savedEntry.paid_up_capital ? Number(savedEntry.paid_up_capital) : undefined,
                    authorized_capital: savedEntry.authorized_capital ? Number(savedEntry.authorized_capital) : undefined,
                    default_file:  savedEntry.financials_file ?? undefined,
                    financials_file:  undefined,
                }) 
                setTouched(true)
            },
            onError: (error) => handleAxiosError(error),
        })
    }

    return {
        register,
        handleSubmit,
        onSubmit,
        watch,
        errors,
        numericField,
        isPending,
        control,
        touched
    }
}

export default useFinancialsDetails
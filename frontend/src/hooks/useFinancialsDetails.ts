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
import useInstanceMutation from "./api/useInstanceMutation";

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

const fileRowSchema = z.object({
    id: z.number().optional(),
    file_title: z.string().min(1, "Title is required"),
    file: fileSchema.optional(),
    default_file: z.string().optional()
})

const financialsSchema = z.object({
    id: z.number().optional(),
    total_assets: z.number().optional(),
    net_profit: z.string().optional(),
    net_worth: z.string().optional(),
    total_revenue: z.string().optional(),
    asset_ratio : z.number().optional(),
    financial_year: z.number().int().positive().min(2000).max(new Date().getFullYear()),
    files: z.array(fileRowSchema).optional()
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
        getValues,
        register,
        handleSubmit,
        watch,
        reset,
        control,
        formState: { errors },
    } = useForm<FinancialEntryFormData>({
        resolver: zodResolver(financialsSchema),
        defaultValues: financials_data ?? { files: [] }
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

    const {mutate: onDelete, isPending: isDeleting} = useInstanceMutation();
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

        if (entry.files) {
            let newFileIndex = 0;
            entry.files.forEach((fileRow, index) => {
                if (fileRow.id) {
                    formData.append(`existing_files[${index}].id`, String(fileRow.id));
                    formData.append(`existing_files[${index}].file_title`, fileRow.file_title);
                } else {
                    formData.append(`new_files_titles[${newFileIndex}]`, fileRow.file_title);
                    if (fileRow.file instanceof FileList && fileRow.file.length > 0) {
                        formData.append(`new_files[${newFileIndex}]`, fileRow.file[0]);
                    } else {
                        // Empty file append to keep indices aligned if needed, though FileList should be present
                        formData.append(`new_files[${newFileIndex}]`, new File([""], "empty"));
                    }
                    newFileIndex++;
                }
            });
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
                files: initialFiles,
                ...initialData 
            } = financials_data;
            const { 
                id: current_id,
                files: currentFiles,
                ...currentData
            } = data;
            
            const trackedChanges = handleTrackChangedFields(initialData, currentData);
            
            changes = trackedChanges || {};
            changes.id = data.id;
            changes.files = currentFiles; // Always send files for backend to process deletions and additions
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
                    files: savedEntry.files?.map((f: any) => ({
                        id: f.id,
                        file_title: f.file_title,
                        default_file: f.file
                    })) || [],
                }) 
                setTouched(true)
            },
            onError: (error) => handleAxiosError(error),
        })
    }
    const deleteFile = (id: number) =>{
        onDelete({
            url : `/api/financial-files/${id}/`,
            mode : "deletion"
        }, {
            onSuccess : () => {
                cache.removeFromList(["subject", "financials", "files"], id)
                toast.success("Financial file deleted successfully")
                setTouched(true)
            },
            onError : (error) => handleAxiosError(error)
        })
        
    }
    return {
        deleteFile,
        register,
        handleSubmit,
        onSubmit,
        watch,
        getValues,
        isDeleting,
        errors,
        numericField,
        isPending,
        control,
        touched,
    }
}

export default useFinancialsDetails
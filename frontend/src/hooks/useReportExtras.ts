import { genStorageKey, handleAxiosError, handleTrackChangedFields } from '@/lib/utils';
import type { Report, ReportExtrasProps } from '@/types/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import useDetailCacheUpdate from './useDetailCacheUpdate';
import { getItem } from '@/lib/storage';
import useSectionTouched from './useSectionTouched';
import useInstanceMutation from './api/useInstanceMutation';

const schema = z.object({
    contact_person :z.string().optional(),
    report_date : z.string().nullable().optional()
})

export type ReportExtrasFormData = z.infer<typeof schema>;
export default function useReportExtras({
    report_extras, 
    report_id,
    subject_type
}:ReportExtrasProps) {
    const {
        reset,
        register,
        handleSubmit,
        formState : {errors},
    } = useForm<ReportExtrasFormData>({
        resolver : zodResolver(schema),
        defaultValues : report_extras
    })
    const { mutate, isPending } = useInstanceMutation();
    const cache = useDetailCacheUpdate<Report>(['report', subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "report_extras"), [report_id, subject_type])
    const {onTouched, touched} = useSectionTouched(CACHE_KEY);
    
    useEffect(() => {
        if (report_extras) {
            reset(report_extras);
        }
    }, [report_extras, reset]);

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched") onTouched();
    }, [report_id, subject_type, CACHE_KEY, onTouched])

    const onSubmit = (data: ReportExtrasFormData) =>{
        const changes = handleTrackChangedFields(report_extras, data)
        if(!changes){
            onTouched();
            return;
        }
        mutate({
            url : `/api/reports/${report_id}/`,
            data,
            mode:  "update"
        }, {
            onSuccess : (report: Report) =>{
                if(changes.contact_person){ cache.set(["contact_person"], report.contact_person) }
                if (changes.report_date){ cache.set(["report_date"], report.report_date) }
                onTouched();
            },
            onError: (error) => handleAxiosError(error)
        })
    }

    return {
        onTouched, 
        register,
        handleSubmit,
        mutate,
        onSubmit,
        isPending,
        errors,
        touched
    }
}

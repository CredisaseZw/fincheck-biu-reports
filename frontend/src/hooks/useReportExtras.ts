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
import { toast } from 'sonner';
import { CURRENCY } from '@/constants';

const REPORT_REASON = z.enum([
    'credit_line',
    'kyc',
    'kys',
    'rentals',
    'loan',
    'insurance_assets',
    'insurance_loan',
    'insurance_supplier_cover',
    'other',
])
const OCCURRENCE = z.enum(['once_off', 'recurring'])

export const REPORT_REASONS_OPTIONS = REPORT_REASON.options
export const OCCURRENCE_OPTIONS = OCCURRENCE.options
const schema = z.object({
    username : z.string().optional(),
    contact_person :z.string().optional(),
    contact_person_mobile: z.string().optional(),
    report_reason: REPORT_REASON.optional(),
    currency: CURRENCY.optional(),
    amount: z.number().optional(),
    period: z.string().optional(),
    occurrence: OCCURRENCE.optional(),
    username_mobile : z.string().optional(),
    report_narration: z.string().optional(),
})

export type ReportExtrasFormData = z.infer<typeof schema>;
export default function useReportExtras({
    report_extras, 
    report_id,
    subject_type
}:ReportExtrasProps) {
    const {
        control,
        reset,
        getValues,
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
    const {onTouched, touched} = useSectionTouched(CACHE_KEY)
    
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
            data: changes,
            mode:  "update"
        }, {
            onSuccess : (report: Report) =>{
                if (changes.username_mobile) { cache.set(["username_mobile"], report.username_mobile)}
                if (changes.username) { cache.set(["username"], report.username)}
                if (changes.contact_person) { cache.set(["contact_person"], report.contact_person) }
                if (changes.report_reason) { cache.set(["report_reason"], report.report_reason) }
                if (changes.currency) { cache.set(["currency"], report.currency) }
                if (changes.contact_person_mobile) { cache.set(["contact_person_mobile"], report.contact_person_mobile) }
                if (changes.amount) { cache.set(["amount"], report.amount) }
                if (changes.period) { cache.set(["period"], report.period) }
                if (changes.occurrence) { cache.set(["occurrence"], report.occurrence) }
                if (changes.report_narration) { cache.set(["report_narration"], report.report_narration)}
                toast.success("Report Extras updated successfully")
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
        getValues,
        control,
        isPending,
        errors,
        touched
    }
}

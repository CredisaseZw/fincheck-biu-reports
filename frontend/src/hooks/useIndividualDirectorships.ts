import type { Individual, IndividualDirectorsProps, Report } from '@/types/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import useDetailCacheUpdate from './useDetailCacheUpdate';
import { genStorageKey, handleAxiosError, handleTrackChangedFields } from '@/lib/utils';
import useSectionTouched from './useSectionTouched';
import { getItem } from '@/lib/storage';
import useInstanceMutation from './api/useInstanceMutation';
import { toast } from 'sonner';

const schema = z.object({
    external_directors : z.string().optional()
})

export type IndividualExternalDirectorsFormData = z.infer<typeof schema>;

function useIndividualDirectorships({
    directorships_data,
    report_id,
    subject_object_id,
}: IndividualDirectorsProps) {
    const {mutate, isPending} = useInstanceMutation();
    const cache = useDetailCacheUpdate<Report>(["report", report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, "individual", "individual_other_directorships"), [report_id])
    const { onTouched, touched }= useSectionTouched(CACHE_KEY)

    const {
        control,
        handleSubmit,
        setValue,
        register,
    } = useForm<IndividualExternalDirectorsFormData>({
        resolver : zodResolver(schema)
    })

    useEffect(()=>{        
        const state = getItem(CACHE_KEY)
        if(state === "touched") onTouched();
    }, [report_id, CACHE_KEY, onTouched])

    useEffect(() => {
        if(directorships_data?.external_directors){
            setValue("external_directors", directorships_data.external_directors)
        }
    },[directorships_data, setValue])

    const onSubmit = (data: IndividualExternalDirectorsFormData) => {
        const changes = handleTrackChangedFields(
            { external_directors: directorships_data?.external_directors}
            , data
        )
        
        if(!changes){
            onTouched()
            return;
        }

        mutate({
            url: `/api/individuals/${subject_object_id}/`,
            mode : "update",
            data : changes
        }, {
            onSuccess: (data : Individual) =>{
                cache.set(["subject", "external_directors"], data.external_directors)
                toast.success("Information successfully updated");
                onTouched()
            },
            onError: (error)=> handleAxiosError(error)
        })
        
    }
    return {
        isPending,
        touched,
        control,
        register,
        handleSubmit,
        onSubmit
    }
}

export default useIndividualDirectorships
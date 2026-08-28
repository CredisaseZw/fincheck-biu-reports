import type { Company, CompanyOverviewProps, Report } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useInstanceMutation from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { useEffect,  useMemo } from "react";
import { getItem } from "@/lib/storage";
import { toast } from "sonner";
import useSectionTouched from "./useSectionTouched";
import { useQueryClient } from "@tanstack/react-query";

const TradingStatus = z.enum(["active", "inactive", "administration", "insolvent"])

const LegalForm = z.enum([
    "pvt_ltd",
    "plc",
    "pbc",
    "partnership",
    "trust",
    "joint_venture",
    "cooperative",
    "sole_trader",
])
export const LegalForms = LegalForm.options;


const schema = z.object({
    legal_form: LegalForm.optional(),
    trading_status: TradingStatus.optional(),
    number_of_employees: z.number().optional(),
   })
export type CompanyOverviewFormData = z.infer<typeof schema>;
function useCompanyOverview({
    company_overview,
    subject_object_id,
    subject_type,
    report_id
}:CompanyOverviewProps) {
    const {
        register,
        handleSubmit,
        getValues,
        reset,
        control,
        formState : {errors}
    } = useForm({
        resolver : zodResolver(schema),
        defaultValues : company_overview
    })

    useEffect(()=>{
        if(company_overview){ reset(company_overview) }
    },[company_overview, reset])
    const client = useQueryClient()
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "overview_details"), [report_id,subject_type])
    const {mutate, isPending} = useInstanceMutation()
    const {onTouched, touched} = useSectionTouched(CACHE_KEY);

    useEffect(()=>{
        
        const state = getItem(CACHE_KEY)
        if(state === "touched")onTouched();
    }, [report_id, subject_type, CACHE_KEY, onTouched])

    const onSubmit = (data: CompanyOverviewFormData) =>{
        const changes = handleTrackChangedFields(company_overview, data)
        if(!changes){
            onTouched()
            return
        }

        mutate({
            url:`/api/companies/${subject_object_id}/`,
            mode : "update",
            data : {
                overview: changes
            }
        }, {
            onSuccess: async(data:Company)=>{
                client.invalidateQueries({ queryKey: ["company" ]})
                cache.set(["subject", "overview"], data.overview)
                toast.info("Company overview successfully updated")
                if(report_id) onTouched();
            }
        })
    }

    return {
        onSubmit,
        register,
        getValues,
        handleSubmit,
        onTouched,
        touched,
        isPending,
        control,
        errors
    }
}

export default useCompanyOverview
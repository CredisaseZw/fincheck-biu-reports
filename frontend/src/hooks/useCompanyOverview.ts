import type { Company, CompanyOverviewProps, Report } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useInstanceMutation from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { getItem, setItem } from "@/lib/storage";
import { toast } from "sonner";

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

    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(()=>genStorageKey(report_id, subject_type, "overview_details"), [report_id,subject_type])
    const {mutate, isPending} = useInstanceMutation()
    const [touched, setTouched] = useState(false)

    useEffect(()=>{
        const state = getItem(CACHE_KEY)
        if(state === "touched"){
            setTouched(true)
        }
    }, [report_id, subject_type, CACHE_KEY])
    const onSubmit = (data: CompanyOverviewFormData) =>{
        const changes = handleTrackChangedFields(company_overview, data)
        if(!changes){
            setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
            setTouched(true)
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
                cache.set(["subject", "overview"], data.overview)
                setItem(CACHE_KEY, "touched", 60 * 60 * 1000 * 24 * 3)
                toast.info("Company overview successfully updated")
                setTouched(true)
            }
        })
    }

    return {
        onSubmit,
        register,
        getValues,
        handleSubmit,
        touched,
        isPending,
        control,
        errors,
  }
}

export default useCompanyOverview
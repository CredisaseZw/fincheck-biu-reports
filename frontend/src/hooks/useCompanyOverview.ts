import type { Company, CompanyOverviewProps, Report } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useInstanceMutation from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { handleTrackChangedFields } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const TradingStatus = z.enum(["active", "inactive", "administration", "insolvent"])
const Condition = z.enum(["good", "fair", "poor"])
const Trend = z.enum(["improving", "stable", "declining"])
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
    condition: Condition.optional(),
    trend: Trend.optional(),
    number_of_employees: z.number().optional(),
    last_financial_result: z.string().optional(),
    net_asset_value: z.string().optional(),
    authorized_share_capital: z.string().optional(),
    issued_share_capital: z.string().optional()
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
    const {mutate, isPending} = useInstanceMutation()
    const [touched, setTouched] = useState(false)
    const onSubmit = (data: CompanyOverviewFormData) =>{
        const changes = handleTrackChangedFields(company_overview, data)
        if(!changes){
            toast.error("No changes made.")
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
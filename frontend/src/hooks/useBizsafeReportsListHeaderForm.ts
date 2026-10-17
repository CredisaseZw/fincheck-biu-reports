import { LONG_MONTHS } from "@/constants";
import { getCurrentMonth, getCurrentYear, getYearRange, handleAxiosError } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useGetBizSafeReports from "./api/useGetBizSafeReports";
import type { setBizsafeResultsType } from "./useBizsafeReportsList";
import { toast } from "sonner";

const YEARS = getYearRange(50).map(item => String(item));
const REPORT_SELECTION = z.enum(["client", "subject"])
const YEARS_ENUM = z.enum(YEARS)
const MONTHS_ENUM =  z.enum(LONG_MONTHS)
const CURRENT_YEAR = getCurrentYear()
const CURRENT_MONTH = getCurrentMonth()

const schema = z.object({
    report_selection: REPORT_SELECTION, 
    entity_value : z.string(),   
    m_year: YEARS_ENUM.optional(),
    m_month:MONTHS_ENUM.optional(),

    p_year: YEARS_ENUM.optional(),
    p_from: MONTHS_ENUM.optional(),
    p_to: MONTHS_ENUM.optional()
})

export type ModeMonths = "month" | "period_month"
export type BizsafeReportListType = z.infer<typeof schema>

function useBizsafeReportsListHeaderForm(setResults: setBizsafeResultsType) {
    const {
        register,
        control,
        getValues, 
        watch,
        handleSubmit,
        formState : { errors }
    } = useForm<BizsafeReportListType>({
        resolver: zodResolver(schema),
        defaultValues: {
            report_selection: "client",
            entity_value: "all",
            m_year :  CURRENT_YEAR,
            m_month: CURRENT_MONTH,
            p_year: CURRENT_YEAR,
            p_from: CURRENT_MONTH,
        }
    })

    const [mode, setMode] = useState<ModeMonths>("month");
    const handleChangeMode = (value : ModeMonths) => setMode(value)
    const { mutate, isPending } = useGetBizSafeReports()

    const onSubmit = (data: BizsafeReportListType) =>{
        if(mode === "period_month"){
            if (!data.p_to){
                toast.error("Period to is required.");
                return;
            }
        }
        
        const PAYLOAD: Record<string, unknown> = {
            mode,
            report_selection: data.report_selection,
            entity_value: data.entity_value,
            ...(mode === "month" ?{
                month_year : data.m_year,
                month_month : data.m_month
            }:{
                period_year: data.p_year,
                period_from: data.p_from,
                period_to: data.p_to
            })
        }
        mutate(PAYLOAD,{
            onSuccess: async(data)=>setResults(data),
            onError: (error)=> handleAxiosError(error)
        })
    }

    return {
        mode,      
        errors,
        control,
        isPending,
        handleChangeMode,
        handleSubmit,
        getValues,
        register,
        onSubmit,
        watch,
    }
}

export default useBizsafeReportsListHeaderForm

import { useState, type Dispatch, type SetStateAction } from "react";
import type { BizsafeReportSummaryResponse } from "@/types/core";
import useDownloadBizSafeReports, { type DownloadPayload } from "./api/useDownloadBizSafeReports";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";

export type setBizsafeResultsType = Dispatch<SetStateAction<BizsafeReportSummaryResponse | null>>
function useBizsafeReportsList() {
    const [results, setResults] = useState<BizsafeReportSummaryResponse | null>(null)
    const {mutate, isPending} = useDownloadBizSafeReports();

    const onDownloadAll = () => {
        if(!results) {
            toast.error("No data loaded");
            return;
        }

        const PAYLOAD: DownloadPayload ={
            group_by : results.group_by,
            label: results.period.label,
            groups: results.results.map(item=>({
                name : item.name,
                reports: item.reports
            }))
        }

        mutate(PAYLOAD, {
            onSuccess: ()=>{
                toast.success("Incoming Download");
                return;
            },
            onError: (error)=>handleAxiosError(error)
        })
    }

    return {
        isPending,
        results,
        setResults,
        onDownloadAll
    }
}

export default useBizsafeReportsList

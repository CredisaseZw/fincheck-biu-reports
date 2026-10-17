import { api } from "@/axios/api";
import type { BizsafeReportSummaryResponse } from "@/types/core";
import { useMutation } from "@tanstack/react-query";

function useGetBizSafeReports() {
    const { mutate, isPending } = useMutation({
        mutationFn : async( payload: Record<string, unknown>) =>{
            const response = await api.get<BizsafeReportSummaryResponse>("/api/bizsafe-reports/analytic-search/", {
                params : payload
            })
            return response.data;
        }
    })
    return {
        mutate,
        isPending
  }
}

export default useGetBizSafeReports
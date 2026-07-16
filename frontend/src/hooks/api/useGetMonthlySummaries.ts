import { api } from "@/axios/api";
import type { MonthlySummary } from "@/types/core";
import { useQuery } from "@tanstack/react-query";

interface props {
    params: Record<string, string | number>
    enabled?: boolean

}
function useGetMonthlySummaries({params, enabled = true}:props) {
    const {
        data,
        isLoading,
        isError,
        isRefetching,
        error,
        refetch
    } = useQuery({
        queryKey: ["monthly_summaries", params],
        queryFn : async()=>{
            const response = await api.get<MonthlySummary[]>("/api/archived-reports/monthly_summary/", {params})
            return response.data;
        },
        enabled
    })

    return {
        data,
        isLoading,
        isError,
        isRefetching,
        error,
        refetch
    }
}

export default useGetMonthlySummaries
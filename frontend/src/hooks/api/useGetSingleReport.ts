import { api } from "@/axios/api";
import type { Report } from "@/types/core";
import { useQuery } from "@tanstack/react-query";

function useGetSingleReport(id: number | undefined, enabled : boolean) {
    const {data, isLoading, error} = useQuery({
        queryKey: ["report", id],
        queryFn : async()=>{
            const response = await api.get<Report>(`/api/reports/${id}/`);
            return response.data;
        },
        enabled : Boolean(enabled),
        staleTime: 30 * 1000,
    })
    return {
        data,
        isLoading,
        error
    }
}

export default useGetSingleReport
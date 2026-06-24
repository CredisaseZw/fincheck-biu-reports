import { api } from "@/axios/api";
import type { EntityValue, Report } from "@/types/core";
import { useQuery } from "@tanstack/react-query";

interface props {
    id: number | undefined, 
    enabled : boolean,
    subject_type? : EntityValue
}
function useGetSingleReport({
    id,
    enabled,
    subject_type
}:props) {
    const {data, isLoading, error} = useQuery({
        queryKey: ["report", subject_type, id],
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
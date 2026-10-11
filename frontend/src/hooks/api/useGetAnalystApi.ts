import { api } from "@/axios/api";
import type { DRFResponse, User } from "@/types/core";
import { useQuery } from "@tanstack/react-query";

export interface SearchAnalystProps{
    params: Record<string, unknown>
    enabled?: boolean
}

function useGetAnalystApi({
    params,
    enabled
}: SearchAnalystProps) {
    const { data, isLoading, isError, error, refetch} = useQuery({
        queryKey : ["search-analyst",params],
        queryFn: async()=>{
            const response = await api.get<DRFResponse<User>>("/api/users/", { params })
            return response.data;
        },
        enabled
    })
    return {
        data,
        error,
        isLoading,
        isError,
        refetch
    }
}

export default useGetAnalystApi
import { api } from "@/axios/api";
import { useQuery } from "@tanstack/react-query";
import useURLParamsFilter from "../useURLParamsFilter";

function useGetArchivedReports(enabled: boolean) {

    const {getUrlParams} = useURLParamsFilter()
    const params = getUrlParams();
    const {
        data, 
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey:["archived-reports", params],
        queryFn :async()=>{
            const response = await api.get("/api/archived-reports/", {params})
            return response.data;
        },
        enabled,
    })
    return {
        data, 
        isLoading,
        isError,
        error
  }
}

export default useGetArchivedReports
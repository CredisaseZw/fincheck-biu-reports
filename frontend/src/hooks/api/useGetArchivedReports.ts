import { api } from "@/axios/api";
import { useQuery } from "@tanstack/react-query";

interface props {
    params: Record<string, string | number>
    enabled: boolean

}
function useGetArchivedReports({params, enabled}:props) {
    const {
        data, 
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey:["reports", params],
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
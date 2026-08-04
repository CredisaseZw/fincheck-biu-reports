import { api } from "@/axios/api";
import type { DRFResponse,  EntityValue, ListCompany } from "@/types/core";
import { useQuery } from "@tanstack/react-query";


function useGetEntityObject(
    mode: EntityValue, 
    params : Record<string, string>,
    enabled = false
) {
    const ENTITY_LINKS: Record<string, string> = {
        "company" : "/api/companies/",
        "individual": "/api/individuals/"
    }
    
    const {data, isLoading, error, isFetching} = useQuery({
        queryKey : [mode, params],
        queryFn: async()=>{
            const response = await api.get<DRFResponse<ListCompany | ListCompany>>(ENTITY_LINKS[mode], {
                params 
            })  
            return response.data
        },
        enabled
    })
    return {
        data,
        isFetching,
        isLoading,
        error
    }
}

export default useGetEntityObject
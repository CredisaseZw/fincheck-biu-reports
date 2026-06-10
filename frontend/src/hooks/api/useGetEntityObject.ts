import { api } from "@/axios/api";
import type { MiniCompany, MiniIndividual, DRFResponse,  EntityValue } from "@/types/core";
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
    console.log({
        link:  ENTITY_LINKS[mode],
        mode,
        params
    })
    const {data, isLoading, error} = useQuery({
        queryKey : [mode, params],
        queryFn: async()=>{
            const response = await api.get<DRFResponse<MiniCompany | MiniIndividual>>(ENTITY_LINKS[mode], {
                params 
            })  
            return response.data
        },
        enabled
    })
    return {
        data,
        isLoading,
        error
    }
}

export default useGetEntityObject
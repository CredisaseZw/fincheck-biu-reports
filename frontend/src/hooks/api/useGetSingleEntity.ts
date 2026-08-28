import { api } from "@/axios/api";
import type { Company, EntityValue, Individual } from "@/types/core";
import { useQuery } from "@tanstack/react-query";
interface props {
  entity_type : EntityValue,
  id: number,
  enabled : boolean
}
function useGetSingleEntity({entity_type, id, enabled}:props) {
    const {
        data,
        isError, 
        isLoading,
        error
    } = useQuery({
        queryKey : [entity_type, id],
        queryFn : async()=>{
            const LINKS:Record<EntityValue, string> = {
                "company" : `/api/companies/${id}/`,
                "individual" : `/api/individuals/${id}/`
            }
            const response = await api.get<Company | Individual>(LINKS[entity_type]);
            return response.data

        },
        enabled : enabled
    })
    return {
        data, 
        isError, 
        isLoading,
        error
    }
}

export default useGetSingleEntity
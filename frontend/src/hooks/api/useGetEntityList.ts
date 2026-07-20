import { api } from "@/axios/api";
import type { DRFResponse, EntityValue, ListCompany, ListIndividual } from "@/types/core";
import { useQuery } from "@tanstack/react-query";
import useURLParamsFilter from "../useURLParamsFilter";

function useGetEntityList() {
    const LINKS:Record<EntityValue, string> = {
      "company" : "/api/companies/",
      "individual" : "/api/individuals/"
    }
    const {getUrlParams} = useURLParamsFilter()
    const params = getUrlParams();
    const { entity_value, ...resolvedParams } = params ?? {}
    const resolvedEntityValue:EntityValue = entity_value && (entity_value === "company" || entity_value === "individual")
    ? entity_value
    :"company"

    const {
      data,
      isLoading,
      isError, 
      error
    } = useQuery({
      queryKey :["entity-lists", resolvedEntityValue, params],
      queryFn :async()=>{
        const response = await api.get<DRFResponse<ListCompany | ListIndividual>>(LINKS[resolvedEntityValue], {
          params : resolvedParams
        })
        return response.data;
      },
      enabled: Boolean(entity_value === "company" || entity_value === "individual") && Boolean(params.search)
    })
    return {
      entity_value,
      data,
      isLoading,
      isError, 
      error
  }
}

export default useGetEntityList
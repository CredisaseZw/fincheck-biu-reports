import { useQuery } from "@tanstack/react-query";
import useURLParamsFilter from "../useURLParamsFilter";
import { api } from "@/axios/api";
import type { DRFResponse, User } from "@/types/core";

function useGetInternalUsers() {
    const { getUrlParams } = useURLParamsFilter();
    const params = getUrlParams();
    const {
      data,
      isLoading,
      isError,
      error
    } = useQuery({
        queryKey : ["users", params],
        queryFn : async() =>{
          const response = await api.get<DRFResponse<User>>("/api/users/", {params});
          return response.data; 
        }
    })
    return {
      data,
      isLoading,
      isError,
      error
    }
}

export default useGetInternalUsers
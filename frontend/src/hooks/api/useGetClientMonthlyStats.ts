import { api } from "@/axios/api";
import { useQuery } from "@tanstack/react-query";

export interface ClientMonthlyStat {
  month: number;
  finalized: number;
  active: number;
}

function useGetClientMonthlyStats() {
  const {
    data,
    isError,
    error,
    isLoading
  } = useQuery({
    queryKey : ["client-monthly"],
    queryFn : async() =>{
      const response = await api.get<ClientMonthlyStat[]>("/api/client-monthly/")
      return response.data;
    },
    staleTime: 30_000,
  })
  return {
    data,
    isError,
    error,
    isLoading
  }
}

export default useGetClientMonthlyStats
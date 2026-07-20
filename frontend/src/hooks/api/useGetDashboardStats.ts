import { api } from "@/axios/api";
import type { ReportStats } from "@/types/core";
import { useQuery } from "@tanstack/react-query";

function useGetDashboardStats() {
  const {
    data,
    isError,
    error,
    isLoading
  } = useQuery({
    queryKey : ["dashboard-stats"],
    queryFn : async() =>{
      const response = await api.get<ReportStats>("/api/dashboard-stats/")
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

export default useGetDashboardStats
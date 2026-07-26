import { api } from "@/axios/api";
import { useAuth } from "@/contexts/AuthContext";
import type { ReportStats } from "@/types/core";
import { useQuery } from "@tanstack/react-query";

function useGetDashboardStats() {
  const {user} = useAuth()
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
    enabled : Boolean(user?.i_s), 
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
import { useQuery } from "@tanstack/react-query";
import useURLParamsFilter from "../useURLParamsFilter";
import { api } from "@/axios/api";
import type { DRFResponse, ListReport } from "@/types/core";

function useGetReports(params?: Record<string, string | number | boolean>) {
  const { getUrlParams } = useURLParamsFilter();
  const resolvedParams = {...(params ?? getUrlParams())}
  if(resolvedParams.search && resolvedParams.page) delete resolvedParams.page;

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["reports", params],
    queryFn: async () => {
      const response = await api.get<DRFResponse<ListReport>>("/api/reports/", {
        params : resolvedParams,
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  return { data, isLoading, error, isError };
}

export default useGetReports;
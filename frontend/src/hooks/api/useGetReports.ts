import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query";
import useURLParamsFilter from "../useURLParamsFilter";
import { api } from "@/axios/api";
import type { DRFResponse, ListReport } from "@/types/core";

function useGetReports() {
  const { getUrlParams } = useURLParamsFilter();

  const params = useMemo(() => {
    const p = getUrlParams();
    if (p.search) {
      delete p.page;  
    }
    return p;
  }, [getUrlParams]);

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["reports", params],
    queryFn: async () => {
      const response = await api.get<DRFResponse<ListReport>>("/api/reports/", {
        params,
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  return { data, isLoading, error, isError };
}

export default useGetReports;
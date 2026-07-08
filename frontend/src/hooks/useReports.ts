import type { ListReport, PaginationData } from "@/types/core";
import { useEffect, useState } from "react";
import useGetReports from "./api/useGetReports";
import { handleAxiosError } from "@/lib/utils";
import useURLParamsFilter from "./useURLParamsFilter";

function useReports(mode: string = "live") {
    const [pagination, setPagination] = useState<PaginationData | undefined>(undefined)
    const [reports, setReports] = useState<ListReport[]>([])
    const {getUrlParams} = useURLParamsFilter()
    const {data, isLoading, error, isError} = useGetReports({
        status: mode,
        ...getUrlParams()
    })

    useEffect(()=>{
        if(handleAxiosError(error)) return;
        if(!data) return;

        const {results, ...p} = data;
        setReports(results)
        setPagination(p)
        
    }, [data, error])
    
    return {
        pagination,
        reports,
        isLoading,
        isError,
    }
}

export default useReports
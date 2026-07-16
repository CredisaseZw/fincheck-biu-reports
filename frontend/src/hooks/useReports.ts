import type { ListReport, PaginationData } from "@/types/core";
import { useEffect, useState } from "react";
import useGetReports from "./api/useGetReports";
import { handleAxiosError } from "@/lib/utils";

function useReports() {
    const [pagination, setPagination] = useState<PaginationData | undefined>(undefined)
    const [reports, setReports] = useState<ListReport[]>([])
    const {data, isLoading, error, isError, isRefetching} = useGetReports()

    useEffect(()=>{
        if(handleAxiosError(error)) return;
        if(!data) return;

        const {results, ...p} = data;
        setReports(results)
        setPagination(p)
        
    }, [data, error])
    
    return {
        isRefetching,
        pagination,
        reports,
        isLoading,
        isError,
    }
}

export default useReports
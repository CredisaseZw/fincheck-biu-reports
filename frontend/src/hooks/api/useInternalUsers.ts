import type { PaginationData, User } from "@/types/core";
import { useEffect, useState } from "react";
import useGetInternalUsers from "./useGetInternalUsers";
import { handleAxiosError } from "@/lib/utils";

function useInternalUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<PaginationData | undefined>(undefined);
    const {
        data,
        isLoading,
        isError,
        error
    } = useGetInternalUsers();

    useEffect(()=>{
        if(handleAxiosError(error)) return;
        if(!data) return;

        const {results, ...o} =data;
        setUsers(results)
        setPagination(o)

    },[error, data])

    return {
        users,
        pagination,
        isLoading,
        isError
    }
}

export default useInternalUsers
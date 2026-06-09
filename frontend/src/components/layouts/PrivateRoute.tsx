import { api } from "@/axios/api"
import { handleAxiosError } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Navigate, Outlet } from "react-router-dom"

function PrivateRoute() {
    const { isLoading, error, data, isError } = useQuery({
        queryKey: ["validate-admin"],
        queryFn: async () => {
            const response = await api.post("/api/auth/verify-token/")
            return response.data;
        },
        retry: false,
        refetchOnWindowFocus: false,
    })

    if (isLoading) {
        return (
            <div className="flex bg-background items-center justify-center h-screen">
                <img src="/loader.gif"
                    className="w-35 h-auto"
                />
            </div>
        )
    }

    if (isError || error) {
        handleAxiosError(error, "Error validating account");
        return <Navigate to="/" replace />
    }

    if (data) {
        return <Outlet />
    }

    return <Navigate to="/" replace /> 
}

export default PrivateRoute
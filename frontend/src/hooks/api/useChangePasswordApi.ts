import { api } from "@/axios/api";
import { useMutation } from "@tanstack/react-query"

interface ChangePasswordPayload {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

function useChangePasswordApi() {
    const { mutate, isPending } = useMutation({
        mutationFn: async (payload: ChangePasswordPayload) => {
            const response = await api.post("/api/auth/change-password/", payload);
            return response.data;
        }
    })
    return {
        mutate,
        isPending
    }
}

export default useChangePasswordApi

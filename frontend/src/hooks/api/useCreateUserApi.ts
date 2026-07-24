import { api } from "@/axios/api";
import { useMutation } from "@tanstack/react-query";
import type { CreateUserFormData } from "../useCreateUser";

function useCreateUserApi() {
    const { mutate, isPending } = useMutation({
        mutationFn: async(data: CreateUserFormData) => {
            const response = await api.post("/api/auth/register/", data)
            return response.data;
        },
    });
    
    return {
        mutate, isPending
    }
}

export default useCreateUserApi
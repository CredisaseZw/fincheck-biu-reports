import { api } from "@/axios/api";
import { useMutation } from "@tanstack/react-query";

export interface CreateUserInterface {
    mode : "external" | "internal",
    data: Record<string, unknown>
}

function useCreateUserApi() {
    const { mutate, isPending } = useMutation({
        mutationFn: async({mode, data}: CreateUserInterface) => {
            const l: Record<"external" | "internal", string> = {
                external : "/api/auth/register-external/",
                internal : "/api/auth/register-internal/"
            }
            const response = await api.post(l[mode], data)
            return response.data;
        },
    });
    
    return {
        mutate, isPending
    }
}

export default useCreateUserApi
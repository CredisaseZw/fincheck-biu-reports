import { api } from "@/axios/api";
import { useMutation } from "@tanstack/react-query";

export interface UpdateUserPayload {
    id: number;
    data: Record<string, unknown>;
}

function useUpdateUserApi() {
    const { mutate, isPending } = useMutation({
        mutationFn: async ({ id, data }: UpdateUserPayload) => {
            const response = await api.patch(`/api/users/${id}/`, data);
            return response.data;
        },
    });

    return {
        mutate,
        isPending,
    };
}

export default useUpdateUserApi;

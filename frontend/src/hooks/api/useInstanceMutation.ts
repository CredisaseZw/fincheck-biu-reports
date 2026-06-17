import { api } from "@/axios/api";
import { useMutation } from "@tanstack/react-query";

interface props{
    url: string,
    mode: "create" | "update" | "deletion",
    data?: Record<string, any> 
}
function useInstanceMutation() {
    const {mutate, isPending} = useMutation({
        mutationFn : async({
            url,
            mode, 
            data
        }:props) => {
            const response = mode === "create"
            ? api.post(url, data)
            : mode === "update"
            ? api.patch(url, data)
            : api.delete(url)

            return (await response).data;
        } 
    })
    return {
        mutate,
        isPending
    }
}

export default useInstanceMutation
import { api } from "@/axios/api";
import type { SignInResponse} from "@/types/core";
import { useMutation } from "@tanstack/react-query"

function useLoginApi() {
    const {mutate, isPending} = useMutation({
        mutationFn : async( payload : {email:string, password : string}) =>{
            const response  = await api.post<SignInResponse>("/api/auth/login/", payload);
            return response.data;
        }
    })
    return {
        mutate,
        isPending
  }
}

export default useLoginApi
import { api } from "@/axios/api";
import type { EntityValue } from "@/types/core";
import { useMutation } from "@tanstack/react-query";

export interface CreateEnquiryProps {client_object_id : number, client_type: EntityValue}
function useCreateEnquiry() {
    const { mutate } = useMutation({
        mutationFn : async(data: CreateEnquiryProps)=>{
            const response = await api.post("/api/enquiries/", data);
            return response.data;
        }
    })
    return {
        mutate
    }
}

export default useCreateEnquiry
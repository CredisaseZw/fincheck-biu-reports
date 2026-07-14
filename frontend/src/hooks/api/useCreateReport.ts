import { api } from "@/axios/api";
import type { EntityValue } from "@/types/core";
import { useMutation } from "@tanstack/react-query";

export interface CreateReportPayload {
    subject_object_id: number,
    subject_type : EntityValue
    client_object_id : number,
    client_type : EntityValue,
    username?: string
    subject_unique_id?: string
}

function useCreateReport() {
    const {mutate, isPending } = useMutation({
        mutationFn :async( payload: CreateReportPayload ) =>{
            const response = api.post("/api/reports/", payload)
            return (await response).data;
        }
    })
    return {
        mutate, isPending
  }
}

export default useCreateReport
import type { Report, TradeReferencesProps } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import { toast } from "sonner";
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import { handleAxiosError, handleTrackChangedArray } from "@/lib/utils";
import { useEffect } from "react";

const PaymentTrends = z.enum(["good", "fair", "poor"])
const PaymentTrendsOptions = PaymentTrends.options;

const reference = z.object({
  id : z.number().optional(),
  referenced_date : z.string().min(1, "Date is required"),
  name  : z.string().min(1, "Name is required"),
  contact_info : z.string().optional(),
  reference_source : z.string().optional(),
  position : z.string().optional(),
  credit_limit : z.string().optional(),
  credit_terms : z.string().optional(),
  payment_trend : PaymentTrends.optional()
})

const schema = z.object({
  trade_references : z.array(reference)
})

export type TradeReferenceFormData = z.infer<typeof reference>
type TradeReferencesFormData = z.infer<typeof schema>

function useTradeReferences({
  trade_references_data,
  report_id,
  subject_object_id,
  subject_type
}:TradeReferencesProps) {
  const {
    handleSubmit,
    register, 
    reset,
    getValues,
    control,
    formState : { errors }
  } = useForm({
    resolver : zodResolver(schema),
    defaultValues : {
      trade_references : trade_references_data
    }
  })

  useEffect(()=>{
    if(trade_references_data){
      reset({
        trade_references : trade_references_data
      })
    }
  }, [reset, trade_references_data])

  const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
  const {mutate, isPending} = useInstanceMutation();

  const onSubmit = (data: TradeReferencesFormData) => {
    if(!subject_object_id || !subject_type){
      toast.error("No working report loaded.")
      return;
    }   
    const changes = handleTrackChangedArray(trade_references_data, data.trade_references);
    if(!changes){
      toast.error("No changes made.")
      return;
    } 
    const payload: InstanceMutation = {
      url : subject_type === "company"
      ? `/api/companies/${subject_object_id}/`
      : `/api/individuals/${subject_object_id}/`,
      mode : "update",
      data : {
        trade_references :  changes
      }
    }
    mutate(payload, {
      onSuccess: (data) =>{
        cache.set(["subject"], data)
        toast.success("Trade references updated successfully.");
      },
      onError : (e)=> handleAxiosError(e)
    })
  }

  const { fields, append, remove } = useFieldArray({
    control,
    name : "trade_references"
  })

  const onDelete = (id:number) =>{
    const payload:InstanceMutation = {
      url : `/api/trade_references/${id}/`,
      mode : "deletion"
    }
    mutate(payload, {
      onSuccess : ()=>{
        cache.removeFromList(["subject", "trade_references"],id)
        toast.success("Trade references deleted successfully.");
      }
    })
  }

  return {
    append,
    remove,
    onSubmit,
    getValues,
    handleSubmit,
    register,
    onDelete,
    fields,
    errors,
    control,
    isPending,
    PaymentTrendsOptions
  }
}

export default useTradeReferences
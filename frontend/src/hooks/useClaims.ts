/* eslint-disable @typescript-eslint/no-unused-vars */
import { CURRENCY, DEBTOR_TYPE, SETTLEMENT_OPTIONS } from "@/constants";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from  "zod"
import type { SearchEntityRef } from "@/components/general/SearchEntity";
import { useEffect, useRef } from "react";
import type { EntityValue } from "@/types/core";
import { toast } from "sonner";
import { handleAxiosError, handleTrackChangedArray } from "@/lib/utils";
import type { InstanceMutation } from "./api/useInstanceMutation";
import useInstanceMutation from "./api/useInstanceMutation";

 
const claim = z.object({
  id : z.number().optional(),
  creditor_name : z.string().min(1, "Creditor Name is required"),
  currency :CURRENCY,
  amount : z.number("A valid number is needed").positive("A positive number is required"),
  claim_date: z.string().optional(),
  status : SETTLEMENT_OPTIONS,
  debtor_object_id : z.number().positive("A valid debtor object id is required"),
  debtor_type : DEBTOR_TYPE,
  debtor_default :z.string().optional()
})  

const claimsSchema = z.object({
  claims : z.array(
    claim
  )
})

export type ClaimFormData = z.infer<typeof claim>
export type ClaimsFormData = z.infer<typeof claimsSchema>
interface props {
  claims_data: ClaimFormData[]
  subject_object_id?: number | null
  subject_type?: EntityValue | null
}
function useClaims({claims_data, subject_object_id, subject_type}:props) {
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    control,
    formState :{ errors }
  } = useForm<ClaimsFormData>({
    resolver : zodResolver(claimsSchema),
    defaultValues : {
      claims : claims_data
    }
  })
  
  useEffect(()=>{
    if(claims_data){
      reset({
        claims: claims_data
      })
    }
  }, [reset, claims_data])

  const {mutate, isPending} = useInstanceMutation()
  const refs = useRef<(SearchEntityRef | null)[]>([])
  const {fields, append, remove} = useFieldArray({
    control,
    name : "claims"
  })  
  

  const onSubmit = (data: ClaimsFormData) =>{
    if(!subject_object_id || !subject_type){
      toast.error("No working report loaded.")
      return;
    }
    const current_data = data.claims.map(({ debtor_default, ...claim }) => ({
      ...claim,
      ...(claim.id ? {} : { id: undefined }),
    }));

    const initial_data = claims_data.map(item => {
      const {debtor_default, ...item_} = item
      return item_
    })

    const changes = handleTrackChangedArray(initial_data, current_data)
    if(changes.length === 0){
      toast.info("No changes made")
      return
    }

    const payload: InstanceMutation = {
      url : "/api/credit-records/claims/",
      mode : "update",
      data : {
        subject_object_id, 
        subject_type,
        claims : changes
      }
    }
    mutate(payload, {
      onSuccess : (data) =>{
        console.log(data)
        toast.success("Claims updated successfully")
      },
      onError :(error) => handleAxiosError(error)
    })
  }

  const onDelete = (id:number) =>{
    mutate({
      url : `/api/credit-records/claims/${id}/`,
      mode:  "deletion"
    }, {
      onSuccess:()=>{
        toast.success("Claim row deleted successfully")
      },
      onError : (error) => handleAxiosError(error)
    })
  }

  

  return {
    setValue,
    watch,
    append,
    remove,
    onSubmit,
    handleSubmit,
    register,
    onDelete,
    refs,
    isPending,
    control,
    errors,
    fields,
  }
}

export default useClaims
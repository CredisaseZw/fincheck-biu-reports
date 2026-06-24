/* eslint-disable @typescript-eslint/no-unused-vars */
import { CURRENCY, DEBTOR_TYPE, SETTLEMENT_OPTIONS } from "@/constants";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from  "zod"
import type { SearchEntityRef } from "@/components/general/SearchEntity";
import { useEffect, useRef } from "react";
import type { AbsconderProps, Report } from "@/types/core";
import { toast } from "sonner";
import { handleAxiosError, handleTrackChangedArray } from "@/lib/utils";
import type { InstanceMutation } from "./api/useInstanceMutation";
import useInstanceMutation from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
 
const absconder = z.object({
  id : z.number().optional(),
  creditor_name : z.string().min(1, "Creditor Name is required"),
  currency :CURRENCY,
  amount : z.number("A valid number is needed").positive("A positive number is required"),
  start_date: z.string().optional(),
  status : SETTLEMENT_OPTIONS,
  debtor_object_id : z.number().positive("A valid debtor object id is required"),
  debtor_type : DEBTOR_TYPE,
  default_search : z.string().optional()
})  

const absconderSchema = z.object({
  absconders : z.array(
    absconder
  )
})

export type AbsconderFormData = z.infer<typeof absconder>
type AbsconderDetailsFormData = z.infer<typeof absconderSchema>

function useAbsconderDetails({
  absconders_data,
  subject_object_id,
  subject_type,
  report_id
}:AbsconderProps) {
  const {
    handleSubmit,
    register,
    watch,
    getValues,
    reset,
    setValue,
    control,
    formState :{ errors }
  } = useForm<AbsconderDetailsFormData>({
    resolver : zodResolver(absconderSchema),
    defaultValues : {
      absconders: absconders_data
    }
  })
  
  useEffect(()=>{
    if(absconders_data){
      reset({
        absconders : absconders_data
      })
    }
  },[reset, absconders_data])
  const { mutate, isPending } = useInstanceMutation()
  const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
  const refs = useRef<(SearchEntityRef | null)[]>([])
  const {fields, append, remove} = useFieldArray({
    control,
    name : "absconders"
  })  


  const onSubmit = (data: AbsconderDetailsFormData) =>{
    if(!subject_object_id || !subject_type){
      toast.error("No working report loaded.")
      return;
    }    
    const current_data = data.absconders.map(({ default_search, ...item }) => ({
      ...item,
      ...(item.id ? {} : { id: undefined }),
    }));

    const initial_data = absconders_data.map(item => {
      const {default_search, ...item_} = item
      return item_
    })
    const changes = handleTrackChangedArray(initial_data, current_data)
    if(changes.length === 0){
      toast.info("No changes made")
      return
    }

    const payload: InstanceMutation = {
      url : "/api/credit-records/absconders/",
      mode : "update",
      data : {
        subject_object_id, 
        subject_type,
        absconders : changes
      }
    }
    mutate(payload, {
      onSuccess : (data) =>{
        cache.set(["subject", "absconders"], data.absconders)
        toast.success("Absconders updated successfully")
      },
      onError :(error) => handleAxiosError(error)
    })
  } 

  const onDelete = (id:number) =>{
    mutate({
      url : `/api/credit-records/absconders/${id}/`,
      mode:  "deletion"
    }, {
      onSuccess:()=>{
        cache.removeFromList(["subject", "absconders"], id)
        toast.success("Absconder row deleted successfully")
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
    getValues,
    refs,
    isPending,
    control,
    errors,
    fields,
  }
}

export default useAbsconderDetails
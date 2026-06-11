import { CURRENCY, DEBTOR_TYPE, SETTLEMENT_OPTIONS } from "@/constants";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from  "zod"
import type { SearchEntityRef } from "@/components/general/SearchEntity";
import { useRef } from "react";

 
const claim = z.object({
  id : z.number().optional(),
  creditor_name : z.string().min(1, "Creditor Name is required"),
  currency :CURRENCY,
  amount : z.number("A valid number is needed").positive("A positive number is required"),
  claim_date: z.string().optional(),
  status : SETTLEMENT_OPTIONS,
  debtor_object_id : z.number().positive("A valid debtor object id is required"),
  debtor_type : DEBTOR_TYPE,
})  

const claimsSchema = z.object({
  claims : z.array(
    claim
  )
})

type ClaimsFormData = z.infer<typeof claimsSchema>

function useClaims() {
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    control,
    formState :{ errors }
  } = useForm<ClaimsFormData>({
    resolver : zodResolver(claimsSchema),
    defaultValues : {
      claims: [{
        id: undefined,
        creditor_name: "",
        currency: "USD",
        amount: undefined,
        claim_date: undefined,
        status: "open",
        debtor_object_id: undefined,
        debtor_type: "company",
      }]
    }
  })
  
  const refs = useRef<(SearchEntityRef | null)[]>([])
  const {fields, append, remove} = useFieldArray({
    control,
    name : "claims"
  })  
  

  const onSubmit = (data: ClaimsFormData) =>{
    console.log(data)
  }

  return {
    setValue,
    watch,
    append,
    remove,
    onSubmit,
    handleSubmit,
    register,
    refs,
    control,
    errors,
    fields,
  }
}

export default useClaims
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const PaymentTrends = z.enum(["good", "fair", "poor"])

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

type TradeReferencesFormData = z.infer<typeof schema>

function useTradeReferences() {
  const {
    handleSubmit,
    register, 
    control,
    formState : { errors }
  } = useForm({
    resolver : zodResolver(schema),
    defaultValues : {
      trade_references : [{}]
    }
  })

  const onSubmit = (data: TradeReferencesFormData) => {
    console.log(data)
  }

  const { fields, append, remove } = useFieldArray({
    control,
    name : "trade_references"
  })

  return {
    append,
    remove,
    onSubmit,
    handleSubmit,
    register,
    fields,
    errors,
    control
  }
}

export default useTradeReferences
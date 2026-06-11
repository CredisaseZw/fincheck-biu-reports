import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
   numbers_of_shares : z.number("Enter a valid number of shares").positive("Positive numbers required"),
   numbers_of_shareholders : z.number("Enter a valid number of shareholders").positive("Positive numbers required"),
   shareholders : z.array(
    z.object({
        id : z.number().optional(),
        full_name : z.string(),
        address : z.string(),
        number_of_shares : z.number("Enter a valid number of shares").positive("Positive numbers required"),
        percentage_ownership : z.number("Enter a valid percentage")
        .min(0, "Min value is 0").max(100, "Max value is 100")
        .positive("Positive numbers required")
    })
   )
})

type ShareholdingsFormData = z.infer<typeof schema>;

function useShareholdingDetails() {
    const {
        register,
        handleSubmit,
        control,
        formState : { errors }
    } = useForm({
        resolver : zodResolver(schema),
        defaultValues : {
            numbers_of_shareholders : undefined,
            numbers_of_shares : undefined,
            shareholders :[{
                id : undefined,
                full_name : "",
                address : "",
                number_of_shares : undefined,
                percentage_ownership :undefined
            }]
        }
    })

    const {fields, append, remove} = useFieldArray({
        control,
        name : "shareholders"
    })

    const onSubmit = (data: ShareholdingsFormData) =>{
        console.log(data)
    }

    return {
        fields, 
        append, 
        remove,
        register,
        handleSubmit,
        errors,
        onSubmit
    }
}

export default useShareholdingDetails
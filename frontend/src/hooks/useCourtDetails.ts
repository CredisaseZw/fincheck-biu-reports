import {zodResolver} from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod"

const schema = z.object({
    id : z.number().optional(),
    court_name : z.string().min(1,"Court name is required"),
    case_number : z.string().min(1,"A valid case number is required"),
    amount : z.number("Please enter a valid amount").positive("Value should be a positive number"),
    judgement_date :  z.string().min(1, "Date is required")
})
const courtsSchema = z.object({
    court_judgements : z.array(
        schema
    )
})

type CourtJudgementsFormData = z.infer<typeof courtsSchema>

function useCourtDetails() {
    const {
        register,
        handleSubmit,
        control,
        formState : {errors}
    } = useForm({
        resolver : zodResolver(courtsSchema),
        defaultValues :{
            court_judgements : [{
                id : undefined,
                case_number : "",
                court_name : "",
                amount: undefined,
                judgement_date : ""
            }]
        }
    })

    const {fields, append, remove} = useFieldArray({
        control,
        name : "court_judgements"
    })

    const onSubmit = (data: CourtJudgementsFormData) =>{
        console.log(data)
    }

    return {   
        fields,
        errors,
        handleSubmit,
        append,
        register,
        remove,
        onSubmit
    }
}

export default useCourtDetails
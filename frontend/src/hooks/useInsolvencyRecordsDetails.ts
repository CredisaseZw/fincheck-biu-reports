import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import {z} from "zod"

const InsolvencyType = z.enum(["insolvency", "bankruptcy", "judicial_management"])
const schema = z.object({
    id:z.number().optional(),
    insolvency_type : InsolvencyType,
    start_date: z.string().min(1, "Start Date is required"),
    end_date: z.string().min(1, "End date is required."),
    court_reference : z.string().min(1, "Court Reference.")
})

const insolvencyRecordsSchema = z.object({
    insolvency_records : z.array(schema)
})

type InsolvencyRecordsFormData = z.infer<typeof insolvencyRecordsSchema>

function useInsolvencyRecordsDetails() {
    const {
        register,
        handleSubmit,
        control,
        formState : {errors}
    } = useForm({
        resolver : zodResolver(insolvencyRecordsSchema),
        defaultValues :{
            insolvency_records : [{
                insolvency_type : undefined,
                start_date : "",
                end_date : "",
                court_reference : ""
            }]
        }
    })
    const {fields, append, remove} = useFieldArray({
        control,
        name : "insolvency_records"
    })

    const onSubmit = (data: InsolvencyRecordsFormData) => {
        console.log(data)
    }

    return {
        control,
        errors,
        fields,
        append,
        register,
        handleSubmit,
        remove,
        onSubmit
    }
}

export default useInsolvencyRecordsDetails
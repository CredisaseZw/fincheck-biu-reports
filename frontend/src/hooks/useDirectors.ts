import {useForm, useFieldArray} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"

const Positions = z.enum(["director", "secretary", "other"])
const Genders = z.enum(["male", "female"])

const schema = z.object({
    directors : z.array(
        z.object({
            full_name : z.string().min(1,"A valid name is required"),
            position: Positions,
            gender : Genders,
            dob : z.string().optional(),
            address_latest : z.string().optional(),
            address_prev : z.string().optional(),
            national_id : z.string().optional().refine((val) => {
                if (!val) return true
                const nidRegex = /^\d{2}\d{6,7}[A-Za-z]\d{2}$/
                const passportRegex =/^[A-Za-z]{2}\d{7}$/
                return nidRegex.test(val) || passportRegex.test(val)
            }, { message: "A valid Zimbabwe national ID or passport number is required" }),
            email : z.string().email("A valid email is required"),
            mobile_phone_number :z.string().optional(),
            insolvencies_judgements : z.string().optional()
        })  
    )
})

type DirectorsFormData = z.infer<typeof schema>;

function useDirectors() {
    const {
        register,
        handleSubmit, 
        control,
        formState : {errors}
    } = useForm<DirectorsFormData>({
        resolver :zodResolver(schema),
        defaultValues : {
            directors :[{
                full_name :"",
                gender: "male",
                position : "director",
                dob : "",
                address_latest :"",
                address_prev :"",
                email :"",
                mobile_phone_number :""
            }]
        }
    })

    const {append, remove, fields} = useFieldArray({
        control,
        name  :"directors"
    })

    const onSubmit = (data : DirectorsFormData) => {
        console.log(data)
    }

    return {
        handleSubmit,
        onSubmit,
        append,
        register,
        remove,
        errors,
        control,
        fields,
    }
}

export default useDirectors
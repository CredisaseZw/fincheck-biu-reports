import { useForm } from "react-hook-form" 
import { zodResolver } from "@hookform/resolvers/zod"
import {z} from "zod"

const schema = z.object({
    auditors : z.string().optional(),
    lawyers  : z.string().optional()
})

export type ProfessionalsFormData = z.infer<typeof schema>

function useProfessionalPartners() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfessionalsFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            auditors : "",
            lawyers : ""
        },
    })

    const onSubmit = (data : ProfessionalsFormData) =>{
        console.log(data)
    }

    return {
        onSubmit,
        register,
        handleSubmit,
        errors
    }
}

export default useProfessionalPartners
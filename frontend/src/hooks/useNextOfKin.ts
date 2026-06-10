import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const nextOfKinSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    relationship: z.string().min(1, "Relationship is required").max(100),
    contact_number: z.string().min(1, "Contact number is required").max(50),
})

export type NextOfKinFormData = z.infer<typeof nextOfKinSchema>

function useNextOfKin() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<NextOfKinFormData>({
        resolver: zodResolver(nextOfKinSchema),
        defaultValues: {
            name: "",
            relationship: "",
            contact_number: "",
        },
    })

    return { register, handleSubmit, errors }
}

export default useNextOfKin
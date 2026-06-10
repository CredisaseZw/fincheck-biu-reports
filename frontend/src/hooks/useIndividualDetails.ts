import { ADDRESS_OBJECT, DEFAULT_ADDRESSES } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const MaritalStatus = z.enum(["single", "married", "divorced", "widowed"])

export const individualSchema = z.object({
    full_name: z.string().min(1, "Full name is required").max(255),
    national_id: z.string().min(1, "National ID / Passport is required").max(100),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    gender: z.string().min(1, "Gender is required").max(50),
    marital_status: MaritalStatus.optional(),
    nationality: z.string().min(1, "Nationality is required").max(100),
    mobile_number: z.string().min(1, "Mobile number is required").max(50),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    residential_address: ADDRESS_OBJECT,
})

export type IndividualFormData = z.infer<typeof individualSchema>

function useIndividualDetails() {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<IndividualFormData>({
        resolver: zodResolver(individualSchema),
        defaultValues: {
            full_name: "",
            national_id: "",
            date_of_birth: "",
            gender: "",
            marital_status: undefined,
            nationality: "",
            residential_address: DEFAULT_ADDRESSES,
            mobile_number: "",
            email: "",
        },
    })

    return { register, control, handleSubmit, errors }
}

export default useIndividualDetails
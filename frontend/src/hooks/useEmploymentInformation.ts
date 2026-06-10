import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const EmploymentStatus = z.enum(["employed", "self_employed", "unemployed", "part_time", "retired", "student"])
const employmentSchema = z.object({
    employer: z.string().max(255).optional(),
    position: z.string().max(255).optional(),
    employment_status: EmploymentStatus.optional(),
    years_employed: z.number().int().positive().optional(),
    monthly_income: z.number().optional(),
    previous_employer: z.string().max(255).optional(),
})

export type EmploymentFormData = z.infer<typeof employmentSchema>

function useEmploymentInformation() {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<EmploymentFormData>({
        resolver: zodResolver(employmentSchema),
        defaultValues: {
            employer: "",
            position: "",
            employment_status: undefined,
            years_employed: undefined,
            monthly_income: undefined,
            previous_employer: "",
        },
    })

    return { register, handleSubmit, errors, control }
}

export default useEmploymentInformation
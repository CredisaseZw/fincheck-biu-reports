import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const companyOperationsSchema = z.object({
    industry: z.string().max(255).optional(),
    target_markets: z.string().optional(),
    operations_territories: z.string().optional(),
    property_ownership: z.string().optional(),
    operational_areas: z.string().optional(),
})

export type CompanyOperationsFormData = z.infer<typeof companyOperationsSchema>

function useCompanyOperations() {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CompanyOperationsFormData>({
        resolver: zodResolver(companyOperationsSchema),
        defaultValues: {
            industry: "",
            target_markets: "",
            operations_territories: "",
            property_ownership: "",
            operational_areas: "",
        },
    })

    return { register, control, handleSubmit, errors }
}

export default useCompanyOperations
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { z } from "zod"

const companyStructureSchema = z.object({
    holding_company: z.string().optional(),
    subsidiaries: z.string().optional(),
    associated_companies: z.string().optional(),
    divisions: z.string().optional(),
    branches: z.string().optional(),
})
export type CompanyStructureFormData = z.infer<typeof companyStructureSchema>

function useCompanyStructure() {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<CompanyStructureFormData>({
        resolver: zodResolver(companyStructureSchema),
        defaultValues: {
            holding_company: "",
            subsidiaries: "",
            associated_companies: "",
            divisions: "",
            branches: "",
        }
    })

    return {
        handleSubmit,
        register,
        control,
        errors,
    }
}

export default useCompanyStructure
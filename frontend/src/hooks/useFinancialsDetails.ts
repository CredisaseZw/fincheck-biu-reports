import { ACCEPTED_TYPES, MAX_SIZE } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const fileSchema = z.custom<FileList>()
    .refine(
        (files) => !files || files.length === 0 || ACCEPTED_TYPES.includes(files[0]?.type),
        "Only PDF, image, Word or Excel files accepted"
    )
    .refine(
        (files) => !files || files.length === 0 || files[0]?.size <= MAX_SIZE,
        "Max file size is 5MB"
    )
    .optional()

const financialsSchema = z.object({
    total_assets: z.number().optional(),
    net_profit: z.number().optional(),
    net_worth: z.number().optional(),
    total_revenue: z.number().optional(),
    paid_up_capital: z.number().optional(),
    authorized_capital: z.number().optional(),
    financial_year: z.number().int().positive().optional(),
    profit_and_loss: fileSchema,
    statement_of_financial_position: fileSchema,
})

export type FinancialsFormData = z.infer<typeof financialsSchema>

const numericField = { setValueAs: (v: string) => v === "" ? undefined : Number(v) }

function useFinancials() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FinancialsFormData>({
        resolver: zodResolver(financialsSchema),
        defaultValues: {
            total_assets: undefined,
            net_profit: undefined,
            net_worth: undefined,
            total_revenue: undefined,
            paid_up_capital: undefined,
            authorized_capital: undefined,
            financial_year: undefined,
            profit_and_loss: undefined,
            statement_of_financial_position: undefined,
        },
    })

    const onSubmit = (data: FinancialsFormData) => {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (value instanceof FileList && value.length > 0) {
                formData.append(key, value[0])
            } else if (value !== undefined) {
                formData.append(key, String(value))
            }
        })
        console.log(formData)
    }

    return { register, handleSubmit, onSubmit, watch, errors, numericField }
}

export default useFinancials
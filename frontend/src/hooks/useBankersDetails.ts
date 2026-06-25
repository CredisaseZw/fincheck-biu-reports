import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CURRENCY } from "@/constants"

const AccountTypes = z.enum(["current", "savings", "loan", "fixed_deposit"])
const Narrations = z.enum(["A", "B", "C", "D", "E"])

const accountSchema = z.object({
    bank: z.string(),
    branch: z.string().optional(),
    account_name: z.string(),
    account_type: AccountTypes,
    account_currency: CURRENCY,
    account_number: z.string(),
    date_of_acquirement: z.string().date(),
    bank_code: z.string(),
    narration: Narrations,
})

const schema = z.object({ accounts: z.array(accountSchema) })

export type BankerDetailsFormData = z.infer<typeof schema>

function useBankersDetails() {
    const {
        getValues,
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<BankerDetailsFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            accounts: [
                {
                    bank: "",
                    branch: "",
                    account_name: "",
                    account_type: "current",
                    account_currency: "ZiG",  
                    account_number: "",
                    date_of_acquirement: "",  
                    bank_code: "",            
                    narration: "C",
                },
            ],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "accounts",
    })

    return {
        append,
        remove,
        getValues,
        register,
        handleSubmit,
        control,
        errors,
        fields,
    }
}

export default useBankersDetails
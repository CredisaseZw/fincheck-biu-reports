import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const AccountTypes = z.enum(["current", "savings", "loan", "fixed_deposit"])

const schema = z.object({
    accounts: z.array(
        z.object({
            bank: z.string(),
            branch: z.string(),
            account_name: z.string().optional(),
            account_type: AccountTypes,
            account_number: z.string(),
        })
    ),
})

export type BankerDetailsFormData = z.infer<typeof schema>

function useBankersDetails() {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<BankerDetailsFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            accounts: [{
                bank : "",
                branch : "",
                account_name : "",
                account_type : "current",
                account_number : ""
            }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "accounts",
    })

    return {
        register,
        handleSubmit,
        control,
        errors,
        fields,
        append,
        remove,
    }
}

export default useBankersDetails
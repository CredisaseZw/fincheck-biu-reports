import { useForm } from "react-hook-form" 
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
    tin_number : z.number().optional(),
    vat_number : z.number().optional(),
    nssa_number : z.number().optional(),
    praz_number : z.number().optional(),
    is_praz_verified : z.boolean(),
    is_nssa_verified : z.boolean(),
    is_vat_verified : z.boolean(),
    is_tin_verified : z.boolean(),
})

type RegistrationAccountsFormData = z.infer<typeof schema>;

function useRegistrationAccounts() {
    const {
        handleSubmit,
        register,
        control,
        formState : { errors }
    } = useForm<RegistrationAccountsFormData>({
        resolver: zodResolver(schema),
        defaultValues : {
            tin_number : undefined,
            vat_number : undefined,
            nssa_number: undefined,
            praz_number : undefined,
            is_nssa_verified : true,
            is_praz_verified : true,
            is_tin_verified : true,
            is_vat_verified : true
        }
    })

    const onSubmit = (data: RegistrationAccountsFormData) => {
        console.log(data)
    }

    return {
        handleSubmit,
        onSubmit,
        register,
        control,
        errors 
  }
}

export default useRegistrationAccounts
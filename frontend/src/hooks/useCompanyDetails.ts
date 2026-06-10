
import { ADDRESS_OBJECT, DEFAULT_ADDRESSES } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { z } from "zod"

const TradingStatus = z.enum(["active", "inactive", "suspended"])
const LegalForm = z.enum(["llc", "plc", "sole_trader", "partnership"])
const Condition = z.enum(["good", "fair", "poor"])
const Trend = z.enum(["improving", "stable", "declining"])

const companyOverviewSchema = z.object({
    date_of_registration: z.string().optional(),    
    legal_form: LegalForm.optional(),
    trading_status: TradingStatus.optional(),
    condition: Condition.optional(),
    trend: Trend.optional(),
    number_of_employees: z.number().optional(),
    last_financial_result: z.number().optional(),
    net_asset_value: z.number().optional(),
    authorized_share_capital: z.number().optional(),
    issued_share_capital: z.number().optional()
})


export const companySchema = z.object({
    registered_name: z.string().min(1, "Registered name is required").max(50),
    trading_name: z.string().max(255).optional(),
    address_registered: ADDRESS_OBJECT,
    address_operations: ADDRESS_OBJECT.optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    telephone_number: z.string().max(20).optional(),
    mobile_number: z.string().max(20).optional(),
    website: z.string()
    .refine(
        val => !val || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(val),
        "Invalid URL"
    )
    .optional(),    
    is_address_registered_verified: z.boolean().optional(),
    overview: companyOverviewSchema.optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>

function useCompanyDetails() {
    const defaultValues: CompanyFormData = {
        registered_name: "",
        trading_name: "",
        address_registered: DEFAULT_ADDRESSES,
        address_operations: undefined,
        email: "",
        telephone_number: "",
        mobile_number: "",
        website: "",
        is_address_registered_verified: true,
        overview: {
            trading_status: "active",
            date_of_registration: "",
            legal_form: undefined,
            condition: "good",
            trend: "stable",
            number_of_employees: undefined,
            last_financial_result: undefined,
            net_asset_value: undefined,
            authorized_share_capital: undefined,
            issued_share_capital: undefined,
        },
    }

    const {
        register,
        control,
        handleSubmit,
        formState : { errors }
    } = useForm<CompanyFormData>({
        resolver : zodResolver(companySchema),
        defaultValues,
    })

    return {
        register,
        handleSubmit,
        defaultValues,
        control,
        errors,
    }
}

export default useCompanyDetails
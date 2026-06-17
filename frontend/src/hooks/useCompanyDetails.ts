
import { ADDRESS_OBJECT, DEFAULT_ADDRESSES, OPTIONAL_ADDRESS_OBJECT } from "@/constants";
import { useReport } from "@/contexts/ReportMutationContext";
import { formatAddressToObject, formatAddressToString, handleTrackChangedFields } from "@/lib/utils";
import type { Company } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { z } from "zod"
import useInstanceMutation from "./api/useInstanceMutation";

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
    address_operations: OPTIONAL_ADDRESS_OBJECT.optional(),
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

type CompanyFormData = z.infer<typeof companySchema>

function useCompanyDetails() {
    const { report } =  useReport()
    const {mutate, isPending } = useInstanceMutation()
    const company_overview = report ? report?.client as Company : undefined;

    const defaultValues: CompanyFormData = {
        registered_name: company_overview?.registered_name ?? "",
        trading_name: company_overview?.trading_name ?? "",
        address_registered: company_overview?.address_registered 
        ? formatAddressToObject(company_overview.address_registered)
        : DEFAULT_ADDRESSES,
        address_operations: company_overview?.address_operations 
        ? formatAddressToObject(company_overview.address_operations)
        : undefined,
        email: company_overview?.email ?? "",
        telephone_number: company_overview?.telephone_number ?? "",
        mobile_number: company_overview?.mobile_number ?? "",
        website: company_overview?.website ?? "",
        is_address_registered_verified: company_overview?.is_address_registered_verified ?? true,
        overview: {
            trading_status: company_overview?.overview?.trading_status ?? "active",
            date_of_registration: company_overview?.overview?.date_of_registration ?? "",
            legal_form: company_overview?.overview?.legal_form ?? undefined,
            condition: company_overview?.overview?.condition ?? "good",
            trend: company_overview?.overview?.trend ?? "stable",
            number_of_employees: company_overview?.overview?.number_of_employees ?? undefined,
            last_financial_result: company_overview?.overview?.last_financial_result ?? undefined,
            net_asset_value: company_overview?.overview?.net_asset_value ?? undefined,
            authorized_share_capital: company_overview?.overview?.authorized_share_capital ?? undefined,
            issued_share_capital: company_overview?.overview?.issued_share_capital ?? undefined,
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

    
    const onSubmit = (data: CompanyFormData) => {
        const changes = handleTrackChangedFields(defaultValues, data)
        if(!changes) return
        
        if(changes.address_registered){
            changes.address_registered = formatAddressToString(changes.address_registered)
        }
        if(changes.address_operations){
            changes.address_operations = formatAddressToString(changes.address_operations)
        }

        
        console.log(changes)
        //mutate()
    }

    return {
        onSubmit,
        register,
        handleSubmit,
        isPending,
        defaultValues,
        control,
        errors,
    }
}

export default useCompanyDetails
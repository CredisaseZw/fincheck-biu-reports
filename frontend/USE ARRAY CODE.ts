import { useForm,useFieldArray } from "react-hook-form" 
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"


const schema = z.discriminatedUnion("client_type", [    
    z.object({
        // REPORT HEADER INFORMATION (important stuff here)
        subject_object_id: z.number(),
        subject_type : z.string(),
        client_object_id : z.number(),
        client_type : z.string(),
        
        // COMMON INFORMATION
        claims: z.array(
            z.object({
            type: z.string().min(1, "Type is required"),
            value: z.string().min(1, "Value is required"),
            })
        ).min(1, "Add at least one claim"),
        
        address : z.object({ 
            address_line_1 : z.string().min(1, "Address street is required"),
            address_line_2 : z.string().optional(),
            state: z.string().min(1, "State is required"),
            city : z.string().min(1, "City is required"),
            zip_code: z.string().optional()
        }),

        secondary_address : z.object({ 
            address_line_1 : z.string().min(1, "Address street is required"),
            address_line_2 : z.string().optional(),
            state: z.string().min(1, "State is required"),
            city : z.string().min(1, "City is required"),
            zip_code: z.string().optional()
        }).optional(),

        // COMPANY OBJECTS
        company_details : z.object({
            client_type : z.literal("company"),
            registered_name : z.string().min(1, "Registered name is required"),
            trading_name : z.string().optional(),
            email : z.string().email("A valid email is required"),
            telephone_number : z.string().optional(),
            mobile_number: z.string().optional(),
            website : z.string().optional()

        }),

        company_overview : z.object({
            client_type : z.literal("company"),
            trading_status: z.string(),
            date_of_registration : z.string().min(1, "Date of registration is required"),
            legal_form : z.string(),
            condition: z.string(),
            trend: z.string(),
            number_of_employees : z.number().optional(),
            last_financial_result : z.number().optional(),
            net_asset_value: z.number().optional(),
            authorized_share_capital:z.number().optional(),
            issued_share_capital:z.number().optional(),
        }),

        company_structure
        

//   }),  
    })

])

// const schema = z.discriminatedUnion("clientType", [
//   z.object({
//     clientType: z.literal("company"),
//     companyName: z.string().min(1, "Company name required"),
//     registrationNumber: z.string().min(1, "Reg number required"),
//     industry: z.string().min(1, "Industry required"),
//   }),
//   z.object({
//     clientType: z.literal("individual"),
//     firstName: z.string().min(1, "First name required"),
//     lastName: z.string().min(1, "Last name required"),
//     nationalId: z.string().min(1, "National ID required"),
//   }),
// ])


type FormData = z.infer<typeof schema>

function useAddReportDialogue() {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
            resolver: zodResolver(schema),
            defaultValues: {
            email: "",
            password: "",
            claims: [{ type: "", value: "" }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "claims", 
    })
    
    return {
        re
    }
}

export default useAddReportDialogue
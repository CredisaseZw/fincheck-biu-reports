import type { Header } from "@/types/core";
import {z} from "zod"
export const ReportHeaders:Header[] = [
    {
        name : "Enquiry Ref",
        textAlign : "center"
    },
    {
        name : "Client",
    },
    {
        name : "Subject To",
    },
    {
        name : "Create At",
        textAlign : "center"
    },
]
export const DEFAULT_ADDRESSES = {
    street_address : "",
    line_2 : "",
    country: "",
    province : "",
    city: "",
    suburb: "",
    postal_code : ""
}

export const ADDRESS_OBJECT = z.object({
    street_address: z.string().min(1, "Street address is required"),
    line_2: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    province: z.string().min(1, "Province is required"),
    city: z.string().min(1, "City is required"),
    suburb: z.string().min(1, "Suburb is required"),
    postal_code: z.string().optional(),
})
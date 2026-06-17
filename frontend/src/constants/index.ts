import type { Address, Header } from "@/types/core";
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
    { name : "Action", textAlign : "center" },
]
export const DEFAULT_ADDRESSES:Address = {
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
export const OPTIONAL_ADDRESS_OBJECT = z.object({
    street_address: z.string().optional(),
    line_2: z.string().optional(),
    country: z.string().optional(),
    province: z.string().optional(),
    city: z.string().optional(),
    suburb: z.string().optional(),
    postal_code: z.string().optional(),
})




export const COMMON_RECORD_HEADERS: Header[] =[
    { name : "Debtor" ,textAlign : "end"},
    { name : "Creditor Name" ,textAlign : "end"},
    { name : "Currency" },
    { name : "Amount"},

]
export const CLAIMS_HEADERS:Header[] = [...COMMON_RECORD_HEADERS,
    { name : "Claim Date" },
    { name : "Status" }
]
export const ABSCONDERS_HEADERS:Header [] = [
    ...COMMON_RECORD_HEADERS,
    { name : "Start Date" },
    { name : "Status" }
]

export const COURT_HEADERS:Header[] = [
    {name : "Court Name", textAlign : "end"},
    {name : "Case Number", textAlign : "end"},
    {name : "Amount",},
    {name : "Judgement Date", textAlign : "end"},
]

export const INSOLVENCY_HEADERS:Header[] = [
    {name : "Insolvency Type", textAlign : "end"},
    {name : "Start Date", },
    {name : "End Date",},
    {name : "Court Reference", textAlign : "end"},
]

export const TRADE_REFERENCES_HEADERS: Header[] = [
    {name : "Name", textAlign: "end"},
    {name : "Contact Info", textAlign: "end"},
    {name : "Reference Source", textAlign: "end"},
    {name : "Position", textAlign: "end"},
    {name : "Credit Limit", textAlign: "end"},
    {name : "Credit Terms", textAlign: "end"},
    {name : "Payment Trends", textAlign: "end"},
    {name : "Reference Date", textAlign: "end"},

]

export const DEBTOR_TYPE = z.enum(["company", "individual"])

export const SETTLEMENT_OPTIONS = z.enum(["open", "settled"])

export const CURRENCY = z.enum(["USD", "ZiG", "AUD", "CAD", "CHF", "ZAR"])

export const numericField = { setValueAs: (v: string) => v === "" ? undefined : Number(v) }

export const MAX_SIZE = 5 * 1024 * 1024

export const ACCEPTED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]
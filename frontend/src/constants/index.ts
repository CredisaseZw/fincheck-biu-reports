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
    country: "Zimbabwe",
    province : "",
    city: "",
    postal_code : ""
}
export const COUNTRIES =  ["Zimbabwe", "Zambia", "Yemen", "Western Sahara", "Wallis and Futuna", "Virgin Islands, U.S.", "Virgin Islands, British", "Viet Nam", "Venezuela", "Vanuatu", "Uzbekistan", "Uruguay", "United States Minor Outlying Islands", "United States", "United Kingdom", 
"United Arab Emirates",
"Ukraine", "Uganda", "Tuvalu", "Turks and Caicos Islands", 
"Turkmenistan", "Turkey", "Tunisia", "Trinidad and Tobago", "Tonga",
"Tokelau", "Togo", "Timor-Leste", "Thailand", "Tanzania, United Republic of",
"Tajikistan", "Taiwan, Province of China", "Syrian Arab Republic", "Switzerland",
"Sweden", "Swaziland", "Svalbard and Jan Mayen", "Surivalue", "Sudan", "Sri Lanka",
"Spain", "South Georgia and the South Sandwich Islands", "South Africa", "Somalia",
"Solomon Islands", "Slovenia", "Slovakia", "Singapore", "Sierra Leone", "Seychelles", "Serbia", "Senegal", "Saudi Arabia", "Sao Tome and Principe", "San Marino", "Samoa", "Saint Vincent and the Grenadines", "Saint Pierre and Miquelon", "Saint Lucia", "Saint Kitts and Nevis", "Saint Helena", "RWANDA", "Russian Federation", "Romania", "Reunion", "Qatar", "Puerto Rico", "Portugal", "Poland", "Pitcairn", "Philippines", "Peru", "Paraguay", "Papua New Guinea", "Panama", "Palestinian Territory, Occupied", "Palau", "Pakistan", "Oman", "Norway", "Northern Mariana Islands", "Norfolk Island", "Niue", "Nigeria", "Niger", "Nicaragua", "New Zealand", "New Caledonia", "Netherlands Antilles", "Netherlands", "Nepal", "Nauru", "Namibia", "Myanmar", "Mozambique", "Morocco", "Montserrat", "Montenegro", "Mongolia", "Monaco", "Moldova, Republic of", "Micronesia, Federated States of", "Mexico", "Mayotte", "Mauritius", "Mauritania", "Martinique", "Marshall Islands", "Malta", "Mali", "Maldives", "Malaysia", "Malawi", "Madagascar", "Macedonia, The Former Yugoslav Republic of", "Macao", "Luxembourg", "Lithuania", "Liechtenstein", "Libyan Arab Jamahiriya", "Liberia", "Lesotho", "Lebanon", "Latvia", "Lao People's Democratic Republic", "Kyrgyzstan", "Kuwait", "Korea, Republic of", "Korea, Democratic People's Republic of", "Kiribati", "Kenya", "Kazakhstan", "Jordan", "Jersey", "Japan", "Jamaica", "Italy", "Israel", "Isle of Man", "Ireland", "Iraq", "Iran, Islamic Republic Of", "Indonesia", "India", "Iceland", "Hungary", "Hong Kong", "Honduras", "Holy See (Vatican City State)", "Heard Island and Mcdonald Islands", "Haiti", "Guyana", "Guinea-Bissau", "Guinea", "Guernsey", "Guatemala", "Guam", "Guadeloupe", "Grenada", "Greenland", "Greece", "Gibraltar", "Ghana", "Germany", "Georgia", "Gambia", "Gabon", "French Southern Territories", "French Polynesia", "French Guiana", "France", "Finland", "Fiji", "Faroe Islands", "Falkland Islands (Malvinas)", "Ethiopia", "Estonia", "Eritrea", "Equatorial Guinea", "El Salvador", "Egypt", "Ecuador", "Dominican Republic", "Dominica", "Djibouti", "Denmark", "Czech Republic", "Cyprus", "Cuba", "Croatia", "Cote D'Ivoire", "Costa Rica", "Cook Islands", "Congo, The Democratic Republic of the", "Congo", "Comoros", "Colombia", "Cocos (Keeling) Islands", "Christmas Island", "China", "Chile", "Chad", "Central African Republic", "Cayman Islands", "Cape Verde", "Canada", "Cameroon", "Cambodia", "Burundi", "Burkina Faso", "Bulgaria", "Brunei Darussalam", "British Indian Ocean Territory", "Brazil", "Bouvet Island", "Botswana", "Bosnia and Herzegovina", "Bolivia", "Bhutan", "Bermuda", "Benin", "Belize", "Belgium", "Belarus", "Barbados", "Bangladesh", "Bahrain", "Bahamas", "Azerbaijan", "Austria", "Australia", "Aruba", "Armenia", "Argentina", "Antigua and Barbuda", "Antarctica", "Anguilla", "Angola", "AndorrA", "American Samoa", "Algeria", "Albania", "land Islands", "Afghanistan"] 


const Countries = z.enum(COUNTRIES, {message : "Country is required"})
export const ADDRESS_OBJECT = z.object({
    street_address: z.string().min(1, "Street address is required"),
    line_2: z.string().optional(),
    country: Countries,
    province: z.string().min(1, "Province is required"),
    city: z.string().min(1, "City is required"),
    postal_code: z.string().optional(),
})
export const OPTIONAL_ADDRESS_OBJECT = z.object({
    street_address: z.string().optional(),
    line_2: z.string().optional(),
    country: z.string().optional(),
    province: z.string().optional(),
    city: z.string().optional(),
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
    {name : "Currency" },
    {name : "Amount",},
    {name : "Judgement Date", textAlign : "end"},
]

export const INSOLVENCY_HEADERS:Header[] = [
    {name : "Insolvency Type", textAlign : "end"},
    {name : "Start Date", textAlign : "end"},
    {name : "End Date",textAlign : "end"},
    {name : "Court Reference", textAlign : "end"},
]

export const PUBLIC_INFORMATION_HEADERS: Header[] = [
    {name : "Record Date", textAlign : "end"},
    {name : "Summary", textAlign : "end"},
    {name : "Link", textAlign : "end"},
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

export const SETTLEMENT_OPTIONS = z.enum(["open", "settled", "disputed", "written_off"])

export const CURRENCY = z.enum(["USD", "ZiG", "AUD", "CAD", "CHF", "ZAR"])
export const CURRENCY_OPTIONS = CURRENCY.options

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


import type { ListReport, PaginationData } from "@/types/core";
import BaseTable from "./BaseTable";
import { TableCell, TableRow } from "../ui/table";
import { getEntityName, getFormattedDate } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { OptionButton } from "./OptionButton";
import OptionsWrapper from "./OptionsWrapper";
import { ClientReportHeaders, ReportHeaders } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import DeleteReportAlert from "@/dialogues/DeleteReportDialogue";

interface props {
    allowDeletion : boolean
    isLoading : boolean
    isError : boolean
    isEmpty: boolean
    paginationData? : PaginationData | undefined
    results: ListReport[]
}

function ArchivedReportsTable({
    isError,
    isEmpty,
    results,
    isLoading,
    paginationData,
    allowDeletion = false
}:props) {
    const {user} = useAuth()
    return (
    <BaseTable
        isEmpty = {isEmpty}
        isError = {isError}
        isLoading = {isLoading}
        paginationData={paginationData}  
        headers={
            user?.i_s
            ?ReportHeaders
            :ClientReportHeaders
        }  
    >
        {
            results.map((item)=>{
            const client_bottom_level = "national_id" in  item.client
            ? item.client.national_id ?? "-"
            : item.client.re_registration_number ?? item.client.registration_number ?? item.client.trading_name ??"-"

            const subject_bottom_level = "national_id" in item.subject
            ? item.subject.national_id ?? "-"
            : item.subject.re_registration_number ?? item.subject.registration_number ?? item.subject.trading_name ?? "-"
                
            return (
            <TableRow key={item.id}>
                <TableCell className="text-center">{item.enquiry_reference}</TableCell>
                <TableCell className="text-center">{getFormattedDate(item.finalized_at ?? item.created_at)}</TableCell>
                <TableCell className="text-center">
                    {getFormattedDate(item.report_date ?? item.created_at)}
                </TableCell>
                {
                    user?.i_s &&     
                    <TableCell>  
                        <div className="flex flex-col gap-1 text-center">
                            <span className="font-bold text-gray-700 dark:text-gray-200">{getEntityName(item.client)}</span>
                            <span>{client_bottom_level}</span>
                        </div>
                    </TableCell>
                }
                <TableCell>
                    <div className="flex flex-col gap-1 text-center">
                        <span className="font-bold text-gray-700 dark:text-gray-200">{getEntityName(item.subject)}</span>
                        <span>{subject_bottom_level}</span>
                    </div>
                </TableCell>
                <TableCell>{(!item.username || item.username.trim() === "") ? '-' : item.username}</TableCell>
                <TableCell className="text-center">
                    {item.overall_risk_rating !== null ? item.overall_risk_rating : "-"}
                </TableCell>
                <TableCell className="flex items-center justify-center">
                    <OptionsWrapper>
                        {
                            
                            (item.status === "finalized")
                            &&<OptionButton
                                onClick={() =>
                                    item.report_pdf
                                        ? window.open(item.report_pdf, "_blank", "noopener,noreferrer")
                                        : toast.error("Report PDF not available")
                                }
                                Icon={ExternalLink}
                                label="View Report"
                            /> 
                        }
                        {
                            allowDeletion &&
                            <DeleteReportAlert
                                isArchived
                                id = {item.id}
                            />
                        }
                    </OptionsWrapper>
                </TableCell>
            </TableRow>
        )})
    }
    </BaseTable>
  )
}

export default ArchivedReportsTable
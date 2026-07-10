import BaseTable from "@/components/general/BaseTable";
import ColumnsContainer from "@/components/general/ColumnsContainer";
import { OptionButton } from "@/components/general/OptionButton";
import OptionsWrapper from "@/components/general/OptionsWrapper";
import SearchBox from "@/components/general/Searchbox";
import SectionHeader from "@/components/general/SectionHeader";
import { StatusPill } from "@/components/general/StatusPills";
import { TableCell, TableRow } from "@/components/ui/table";
import { REPORT_STATUS_PILL_VARIANTS, LiveReportHeaders } from "@/constants";
import AddReportDialogue from "@/dialogues/AddReportDialogue";
import CreateCompanyDialogue from "@/dialogues/CreateCompanyDialogue";
import CreateIndividualDialogue from "@/dialogues/CreateIndividualDialogue";
import DeleteReportAlert from "@/dialogues/DeleteReportDialogue";
import FilterOptionsDialogue from "@/dialogues/FilterOptionsDialgue";
import useReports from "@/hooks/useReports";
import { getEntityName, getFormattedDate, toCap } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

function LiveReports() {
    const {
        pagination,
        reports,
        isLoading,
        isError,
    } = useReports();

    return (
    <div className="flex flex-col gap-6">
        <ColumnsContainer>
            <SectionHeader
                label="Live Reports"
                subLabel="reports"
                total={pagination?.count}
                subTotal={reports.length}
            />
            <div className="flex flex-col gap-3 md:flex-row md:justify-end self-center">
                <AddReportDialogue/>
                <CreateCompanyDialogue/>
                <CreateIndividualDialogue/>
            </div>
        </ColumnsContainer>
        <div className="main-card">
            <ColumnsContainer>
                <SearchBox/>
                <div className="flex justify-end">
                    <FilterOptionsDialogue/>
                </div>
            </ColumnsContainer>

            <div className="mt-5">
                <BaseTable
                    isLoading = {isLoading}
                    isError = {isError}
                    isEmpty = {reports.length === 0}
                    paginationData={pagination}
                    headers={LiveReportHeaders}
                >
                    {
                        reports.map((item)=>{
                            const client_bottom_level = "national_id" in item.client
                        ? item.client.email ?? "-"
                            : item.client.registration_number ?? item.client.trading_name ??"-"

                            const subject_bottom_level = "national_id" in item.subject
                            ? item.subject.email ?? "-"
                            : item.subject.registration_number ?? item.subject.trading_name ?? "-"
                                
                            return (
                            <TableRow key={item.id}>
                                <TableCell className="text-center">{item.enquiry_reference}</TableCell>
                                <TableCell className="text-center">
                                    {getFormattedDate(item.created_at)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-center">
                                        <span className="font-bold text-gray-700 dark:text-gray-200">{getEntityName(item.client)}</span>
                                        <span>{client_bottom_level}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-center">
                                        <span className="font-bold text-gray-700 dark:text-gray-200">{getEntityName(item.subject)}</span>
                                        <span>{subject_bottom_level}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{(!item.username || item.username.trim() === "") ? '-' : item.username}</TableCell>
                                <TableCell className="text-center">
                                    <StatusPill variant={REPORT_STATUS_PILL_VARIANTS[item.status] as any}>
                                        {toCap(item.status)}
                                    </StatusPill>
                                </TableCell>
                                <TableCell className="flex items-center justify-center">
                                    <OptionsWrapper>
                                        {
                                            
                                            (item.status === "finalized")
                                            ? <OptionButton
                                                onClick={() =>
                                                    item.report_pdf
                                                        ? window.open(item.report_pdf, "_blank", "noopener,noreferrer")
                                                        : toast.error("Report PDF not available")
                                                }
                                                Icon={ExternalLink}
                                                label="View Report"
                                            /> 
                                            :<> 
                                                <AddReportDialogue report_item={item}/>
                                                <DeleteReportAlert id={item.id}/>
                                            </>
                                        }
                                    </OptionsWrapper>
                                </TableCell>
                            </TableRow>
                        )})
                    }
                </BaseTable>
            </div>
        </div>
    </div>
  )
}

export default LiveReports
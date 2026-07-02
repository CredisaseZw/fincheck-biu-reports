import BaseTable from "@/components/general/BaseTable";
import ColumnsContainer from "@/components/general/ColumnsContainer";
import { OptionButton } from "@/components/general/OptionButton";
import OptionsWrapper from "@/components/general/OptionsWrapper";
import SearchBox from "@/components/general/Searchbox";
import SectionHeader from "@/components/general/SectionHeader";
import { StatusPill } from "@/components/general/StatusPills";
import { TableCell, TableRow } from "@/components/ui/table";
import { ReportHeaders } from "@/constants";
import AddReportDialogue from "@/dialogues/AddReportDialogue";
import CreateCompanyDialogue from "@/dialogues/CreateCompanyDialogue";
import CreateIndividualDialogue from "@/dialogues/CreateIndividualDialogue";
import DeleteReportAlert from "@/dialogues/DeleteReportDialogue";
import FinalizedReportDialog from "@/dialogues/FinalizedReportDialogue";
import useReports from "@/hooks/useReports";
import { getEntityName, getFormattedDate } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

function Reports() {
    const {
        pagination,
        reports,
        isLoading,
        isError,
    } = useReports();

    const openReportInNewTab = (url: string) => () => {
        if (!url) return;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
    <div className="main-card">
        <ColumnsContainer>
            <SectionHeader
                label="All Reports"
                subLabel="reports"
                total={pagination?.count}
                subTotal={reports.length}
            />
            <div className="flex flex-col gap-3 md:flex-row md:justify-end self-center">
                <SearchBox/>
                <AddReportDialogue/>
                <CreateCompanyDialogue/>
                <CreateIndividualDialogue/>
            </div>
        </ColumnsContainer>
        <div className="mt-5">
            <BaseTable
                isLoading = {isLoading}
                isError = {isError}
                isEmpty = {reports.length === 0}
                paginationData={pagination}
                headers={ReportHeaders}
            >
                {
                    reports.map((item)=>{
                        const client_bottom_level = "national_id" in item.client
                        ? item.client.email ?? "-"
                        : item.client.trading_name ?? "-"

                        const subject_bottom_level = "national_id" in item.subject
                        ? item.subject.email ?? "-"
                        : item.subject.trading_name ?? "-"
                            
                        return (
                        <TableRow key={item.id}>
                            <TableCell className="text-center">{item.enquiry_reference}</TableCell>
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
                            <TableCell className="text-center">
                                <StatusPill variant={item.status === "draft" ? "outline" : "success"}>
                                    {item.status === "draft" ? "Draft" : "Finalized"}
                                </StatusPill>
                            </TableCell>
                            <TableCell className="text-center">
                                {item.overall_risk_rating !== null ? item.overall_risk_rating : "-"}
                            </TableCell>
                            <TableCell className="text-center">
                                {getFormattedDate(item.created_at)}
                            </TableCell>
                            <TableCell className="flex items-center justify-center">
                                <OptionsWrapper>
                                    {
                                        
                                        (item.status === "finalized")
                                        ? <OptionButton
                                            onClick={()=>{
                                                if(item.report_pdf){
                                                    openReportInNewTab(item.report_pdf)
                                                    return
                                                }
                                                toast.error("Report PDF not available")
                                            }}
                                            Icon={ExternalLink}
                                            label="View Report"
                                        /> 
                                        :<>
                                            <AddReportDialogue report_item={item}/>
                                            <FinalizedReportDialog id={item.id}/>
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
  )
}

export default Reports
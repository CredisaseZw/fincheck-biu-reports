import BaseTable from "@/components/general/BaseTable";
import ColumnsContainer from "@/components/general/ColumnsContainer";
import SearchBox from "@/components/general/Searchbox";
import SectionHeader from "@/components/general/SectionHeader";
import { TableCell, TableRow } from "@/components/ui/table";
import { ReportHeaders } from "@/constants";
import AddReportDialogue from "@/dialogues/AddReportDialogue";
import useReports from "@/hooks/useReports";
import { getEntityName, getFormattedDate } from "@/lib/utils";

function Reports() {
    const {
        pagination,
        reports,
        isLoading,
        isError,
    } = useReports();

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
                                {getFormattedDate(item.created_at)}
                            </TableCell>
                            <TableCell className="flex items-center justify-center">
                                <AddReportDialogue report_item={item}/>
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
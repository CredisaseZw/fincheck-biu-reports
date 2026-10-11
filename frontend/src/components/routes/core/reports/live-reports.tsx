import BaseTable from "@/components/general/BaseTable";
import ColumnsContainer from "@/components/general/ColumnsContainer";
import LiveReportRows from "@/components/general/LiveReportRows";
import SearchBox from "@/components/general/Searchbox";
import SectionHeader from "@/components/general/SectionHeader";
import { LiveReportHeaders, LiveClientReportHeaders } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import AddReportDialogue from "@/dialogues/AddReportDialogue";
import ClientRequestReportsDialog from "@/dialogues/ClientRequestReportsDialog";
import CreateCompanyDialogue from "@/dialogues/CreateCompanyDialogue";
import CreateIndividualDialogue from "@/dialogues/CreateIndividualDialogue";
import FilterOptionsDialogue from "@/dialogues/FilterOptionsDialgue";
import useReports from "@/hooks/useReports";

function LiveReports() {
    const { user } = useAuth()
    const {
        pagination,
        reports,
        isLoading,
        isError,
    } = useReports();

    const isStaff = !!user?.i_s

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
                {
                    isStaff
                    ? <AddReportDialogue/>
                    : <ClientRequestReportsDialog/>
                }
                {
                    isStaff && <>
                        <CreateCompanyDialogue/>
                        <CreateIndividualDialogue/>
                    </>
                }
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
                    isLoading={isLoading}
                    isError={isError}
                    isEmpty={reports.length === 0}
                    paginationData={pagination}
                    headers={isStaff ? LiveReportHeaders : LiveClientReportHeaders}
                >
                    {reports.map((item) => (
                        <LiveReportRows key={item.id} item={item} isStaff={isStaff} />
                    ))}
                </BaseTable>
            </div>
        </div>
    </div>
  )
}

export default LiveReports
import BaseTable from "@/components/general/BaseTable";
import ColumnsContainer from "@/components/general/ColumnsContainer";
import SearchBox from "@/components/general/Searchbox";
import SectionHeader from "@/components/general/SectionHeader";
import { Button } from "@/components/ui/button";
import { ReportHeaders } from "@/constants";

function Reports() {
  return (
    <div className="main-card">
        <ColumnsContainer>
            <SectionHeader
                label="All Reports"
                subLabel="reports"
            />
            <div className="flex flex-col gap-3 md:flex-row md:justify-end self-center">
                <SearchBox/>
                <Button>
                    Add Report</Button>
            </div>
        </ColumnsContainer>
        <div className="mt-5">
            <BaseTable
                headers={ReportHeaders}
            />
        </div>
    </div>
  )
}

export default Reports
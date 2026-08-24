import useGetDashboardStats from "@/hooks/api/useGetDashboardStats";
import useReportsDashboard from "@/hooks/useReportsDashboard";
import { toCap } from "@/lib/utils";
import { Calendar1, CalendarDays, CalendarRange } from "lucide-react";
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from "../ui/select";
import ColumnsContainer from "./ColumnsContainer";
import DashboardCard from "./DashboardCard";
import { DashboardStatsSkeleton } from "./Skeletons";
import EnquiryTable from "./EnquiryTable";
import EnquirySearchBox from "./EnquirySearchBox";

function AdminDashboard() {
    const {   
        data: stats,
        isLoading: isStatsLoading 
    } = useGetDashboardStats()
    const {
        currentSubject,
        searchValue,
        listData,
        paginationData,
        isLoading,
        isError,
        isData,
        onClear,
        handleSearchSubmit,
        setSearchValue,
        setCurrentSubject,
    } = useReportsDashboard()
    
  return (
    <div className="flex flex-col gap-5">
        {
            (!stats && isStatsLoading) 
            ? <DashboardStatsSkeleton/>
            : (stats && !isStatsLoading)
            ? <ColumnsContainer numberOfCols={3}>
                <DashboardCard 
                    Icon={Calendar1}
                    label="Reports Today"
                    active={stats?.today.active ?? 0}
                    finalized={stats?.today.finalized ?? 0}
                />
                <DashboardCard 
                    Icon  = {CalendarDays}
                    label="Reports this month"
                    active={stats.this_month.active}
                    finalized={stats.this_month.finalized}
                />
                <DashboardCard 
                    Icon  = {CalendarRange}
                    label="Reports this year"
                    active={stats.this_year.active}
                    finalized={stats.this_year.finalized}
                />
            </ColumnsContainer>
            : <></>
        }
        <div className="card p-5 flex flex-col gap-8 min-w-0 overflow-hidden">
            <form className="flex flex-col md:flex-row gap-3" onSubmit={handleSearchSubmit}>
                <div className="form-group w-full">
                    <label className="text-xl font-bold text-primary dark:text-white">Enquire {toCap(currentSubject)}</label>
                    <div className="flex flex-col md:flex-row gap-2">
                        <Select
                            key = {currentSubject}
                            value={currentSubject}
                            onValueChange={setCurrentSubject}
                        >
                            <SelectTrigger className="mt-[0.8px] w-full md:w-35">
                                <SelectValue placeholder="Please select"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="company">Company</SelectItem>
                                <SelectItem value="individual">Individual</SelectItem>
                            </SelectContent>
                        </Select>
                        <EnquirySearchBox
                            isLoading = {isLoading}
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                            onClear={onClear}
                            currentSubject={currentSubject}
                        />
                    </div>
                </div>
            </form>
            {
                isData &&
                <EnquiryTable
                    isLoading = {isLoading}
                    isError = {isError}
                    paginationData={paginationData}
                    listData={listData}
                    currentSubject={currentSubject}
                />
            }
        </div>

    </div>
  )
}

export default AdminDashboard
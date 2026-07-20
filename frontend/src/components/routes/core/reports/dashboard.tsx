import BaseTable from "@/components/general/BaseTable";
import ColumnsContainer from "@/components/general/ColumnsContainer";
import DashboardCard from "@/components/general/DashboardCard";
import LoadingIndicator from "@/components/general/LoadingIndicator";
import { DashboardStatsSkeleton } from "@/components/general/Skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { CompanyListHeaders, IndividualListHeaders } from "@/constants";
import useGetDashboardStats from "@/hooks/api/useGetDashboardStats"
import useReportsDashboard from "@/hooks/useReportsDashboard";
import { toCap } from "@/lib/utils";
import type { ListCompany, ListIndividual } from "@/types/core";
import { Calendar1, CalendarDays, CalendarRange, Eye, X } from "lucide-react";

function _render_list_individual_rows(data: ListIndividual[]){
    return (
        data.map((item, idx) => (
            <TableRow key={idx}>   
                <TableCell>{item.full_name}</TableCell>
                <TableCell>{item.national_id}</TableCell>
                <TableCell className="text-center">{item.gender ?? "-"}</TableCell>
                <TableCell className="text-center">{item.mobile_number ?? "-"}</TableCell>
                <TableCell>{item.email ?? "-"}</TableCell>
                <TableCell className="flex justify-center">
                    <div
                        className="rounded-full self-center cursor-pointer flex dark:bg-[#1A2330] bg-gray-100 border p-2"
                    >
                        <Eye size={15}/>
                    </div>
                </TableCell>
            </TableRow>
        ))
    )    
}

function _render_list_company_rows(data: ListCompany[]){
    return (
        data.map((item, idx)=> (
            <TableRow key={idx}>
                <TableCell>{item.registered_name}</TableCell>
                <TableCell>{item.trading_name ?? "-"}</TableCell>
                <TableCell className="text-center">{item.registration_number ?? "-"}</TableCell>
                <TableCell>{item.registration_number ?? "-"}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.telephone_number}</TableCell>
                <TableCell className="flex justify-center">
                    <div
                        className="rounded-full self-center cursor-pointer flex dark:bg-[#1A2330] bg-gray-100 border p-2"
                    >
                        <Eye size={15}/>
                    </div>
                </TableCell>
            </TableRow>
        ))
    )
}

function Dashboard() {
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
        <div className="card p-5 flex flex-col gap-8">
            <form className="flex flex-row gap-3" onSubmit={handleSearchSubmit}>
                <div className="form-group">
                    <label className="text-xl font-bold text-primary dark:text-white">Enquire {toCap(currentSubject)}</label>
                    <div className="flex flex-row gap-2">
                        <Select
                            value={currentSubject}
                            onValueChange={setCurrentSubject}
                        >
                            <SelectTrigger className="mt-[0.9px] w-35">
                                <SelectValue placeholder="Please select"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="company">Company</SelectItem>
                                <SelectItem value="individual">Individual</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="relative">
                            <Input
                                className="md:w-xl w-full"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder={
                                    currentSubject === "company"
                                    ? "e.g Registration Name, registration Number, trading Name"
                                    : "e.g Full name, national ID/Passport Number"
                                }
                            />
                             {searchValue && (
                                <button
                                    type="button"
                                    onClick={() =>onClear()}
                                    className="absolute right-5 cursor-pointer top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                > <X size={16} /> </button>
                            )}
                        </div>
                        <Button 
                            className={ isLoading ? "cursor-not-allowed" : ""}
                            disabled = {isLoading}
                            type="submit"

                        >
                            {
                                isLoading && 
                                <LoadingIndicator variant="button"/>
                            }
                            Submit
                        </Button> 
                    </div>
                </div>
            </form>
            {
             isData &&
            <div>
                <BaseTable
                    headers={
                        currentSubject === "company"
                        ? CompanyListHeaders
                        : IndividualListHeaders
                    }
                    paginationData={paginationData}
                    isEmpty = {listData.length === 0}
                    isError = {isError}
                    isLoading = {isLoading}
                >
                    {
                        currentSubject === "company"
                        ? _render_list_company_rows(listData as ListCompany[])
                        : _render_list_individual_rows(listData as ListIndividual[])   
                    }

                </BaseTable>
            </div>
            }
        </div>

    </div>
  )
}

export default Dashboard
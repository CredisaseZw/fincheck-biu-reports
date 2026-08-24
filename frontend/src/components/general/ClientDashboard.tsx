import useReportsDashboard from "@/hooks/useReportsDashboard";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import type { EntityValue } from "@/types/core";
import EnquirySearchBox from "./EnquirySearchBox";
import EnquiryTable from "./EnquiryTable";
import { ClientMonthlyStatsChart } from "./ClientMonthlyStatsChart";

function ClientDashboard() {
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
    <div className="flex flex-col gap-4">
        <div className="card flex flex-col gap-4 min-w-0 overflow-hidden">
            <div className="flex flex-row gap-3">
                <Tabs 
                    value={currentSubject}
                    onValueChange={(val: string)=> setCurrentSubject(val as EntityValue)}
                >
                    <TabsList>
                        <TabsTrigger value = "company">Company</TabsTrigger>
                        <TabsTrigger value = "individual">Individual</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button variant={"link"} className="self-center">Hire Purchaser</Button>
            </div>
            <form onSubmit={handleSearchSubmit}>
                <EnquirySearchBox
                    isLoading = {isLoading}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onClear={onClear}
                    currentSubject={currentSubject}
                />
            </form>
            {
                isData &&
                <div>
                    <EnquiryTable
                        isLoading = {isLoading}
                        isError = {isError}
                        paginationData={paginationData}
                        listData={listData}
                        currentSubject={currentSubject}
                    />
                </div>
            }
        </div>
        <div className="w-full card flex flex-col gap-3">
            <h1 className="text-xl font-bold text-primary dark:text-gray-200">Monthly Stats</h1>
            <ClientMonthlyStatsChart/>
        </div>
    </div>
  )
}

export default ClientDashboard
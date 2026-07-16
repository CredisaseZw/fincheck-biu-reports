import ArchivedReportsTable from "@/components/general/ArchivedReportsTable";
import CollapsableTables from "@/components/general/CollapsableTables";
import ColumnsContainer from "@/components/general/ColumnsContainer";
import SectionHeader from "@/components/general/SectionHeader";
import { CollapsableTableSkeleton } from "@/components/general/Skeletons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getYearRange, ReportHeaders } from "@/constants";
import useBusinessReport from "@/hooks/useBusinessReport";
import { Search, X } from "lucide-react";

function BusinessReports() {
    const {
        monthEndDate,
        currentYear,
        loading,
        data,
        isError,
        searchCategory,
        searchValue,
        mode,
        searchedData,
        paginationData,
        _searchedIsError,
        onClear,
        onSubmit,
        setSearchValue,
        setCurrentYear,
        setMonthEndDate,
        setSearchCategory
    } = useBusinessReport()
    return (
     <div className="flex flex-col gap-6">
        <ColumnsContainer>
            <div className="flex flex-col">
                <span className="font-bold text-2xl text-gray-800 dark:text-light">Finalised Reports</span>
                <span className="text-sm text-gray-500 dark:text-gray-300">Browse completed credit reports grouped by month end date.</span>
            </div>
        </ColumnsContainer>
        <div className="card">
            <ColumnsContainer numberOfCols={2}>
                <ColumnsContainer>
                    <div className="form-group">
                        <Label>Month End Date</Label>
                        <Input
                            type="number"
                            min={"1"}
                            max={"31"}
                            value={monthEndDate}
                            onChange={(e) => setMonthEndDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <Label>Current year</Label>
                        <Select
                            value={currentYear}
                            onValueChange={(e) => setCurrentYear(e)}
                        >
                            <SelectTrigger className="mt-0.5 w-full">
                                <SelectValue placeholder="Please Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                {getYearRange().map((y, i) => (
                                    <SelectItem value={String(y)} key={i}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </ColumnsContainer>

                <div className="flex justify-start lg:justify-end">
                    <div className="form-group w-full">
                        <Label>Search Reports</Label>
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <Select
                                onValueChange={(e) => setSearchCategory(e)}
                                value={searchCategory}
                            >
                                <SelectTrigger className="mt-0.5 w-full sm:w-45 shrink-0">
                                    <SelectValue placeholder="Please Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {ReportHeaders.map(
                                        (item) =>
                                            item.value && (
                                                <SelectItem value={item.value} key={item.name}>
                                                    {item.name}
                                                </SelectItem>
                                            )
                                    )}
                                </SelectContent>
                            </Select>

                            <form
                                className="relative flex items-center justify-center w-full sm:max-w-100"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    onSubmit();
                                }}
                            >
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 self-center text-muted-foreground pointer-events-none"
                                />
                                <Input
                                    type={searchCategory === "created_at" ? "date" : "text"}
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    placeholder="Search something"
                                    className="w-full pl-9 pr-16"
                                />
                                {(searchValue || mode === "search") && (
                                    <button
                                        type="button"
                                        onClick={() => onClear()}
                                        className="absolute right-11 cursor-pointer top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 outline-0 bg-primary p-2 rounded hover:bg-primary/80 cursor-pointer"
                                >
                                    <Search size={15} color="white" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </ColumnsContainer>
        </div>
        {
            loading && 
            <div className="card">
                <CollapsableTableSkeleton/>
            </div>
        }
        {
            !loading &&
            mode === "normal" &&
            <CollapsableTables 
                year={currentYear}
                monthEndDate={monthEndDate}
                summaries={data}
                isEmpty={!data?.length || isError}

            />
        }

        {
         !loading &&
         mode === "search" &&
         <div className="card flex flex-col gap-5">
            <SectionHeader
                label="Results"
                subLabel="reports"
                total={paginationData?.count ?? 0}
                subTotal={searchedData.length}
            />
            <ArchivedReportsTable
                isLoading= {loading}
                isEmpty = {searchedData?.length === 0}
                isError = {_searchedIsError}
                paginationData={paginationData}
                results={searchedData}
                headers={ReportHeaders}
            />
         </div>   
        }


    </div>
  )
}

export default BusinessReports
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import useGetMonthlySummaries from "./api/useGetMonthlySummaries";
import { toast } from "sonner";
import useGetArchivedReports from "./api/useGetArchivedReports";
import type { ListReport, PaginationData } from "@/types/core";
import useURLParamsFilter from "./useURLParamsFilter";

const MIN_DAY = 1;
const MAX_DAY = 31;

function isValidMonthEndDate(value: string) {
    if (!/^\d+$/.test(value)) return false;
    const n = Number(value);
    return n >= MIN_DAY && n <= MAX_DAY;
}

function useBusinessReport() {
    const [monthEndDate, setMonthEndDateState] = useState("25");
    const [currentYear, setCurrentYear] = useState("2026");
    const [searchCategory, setSearchCategory] = useState("subject");
    const [mode, setMode] = useState<"normal" | "search">("normal");
    const [searchValue, setSearchValue] = useState("");
    const [debounceSearch, setDebounceSearch] = useState("")
    const [paginationData, setPaginationData] = useState<PaginationData | undefined>()
    const [searchedData, setSearchedData] = useState<ListReport[]>([])
    const { getUrlParams } = useURLParamsFilter()

    const monthEndDateValid = useMemo(
        () => isValidMonthEndDate(monthEndDate),
        [monthEndDate]
    );

    const { data, isLoading, isError, error } = useGetMonthlySummaries({
        params: { year: currentYear, month_end_date: monthEndDate },
        enabled: Boolean(currentYear) && monthEndDateValid,
    });

    const {
        data: _searchedData,
        isLoading: _searchedLoading,
        isError: _searchedIsError,
        error: _searchError
     } = useGetArchivedReports({
        params : {
            page : getUrlParams().page ?? 1,
            search_category : searchCategory,
            search : debounceSearch
        },
        enabled : Boolean(debounceSearch) && Boolean(searchCategory)
    })

    useEffect(()=>{
        if(handleAxiosError(_searchError)) return;
        if(!_searchedData) return;
        
        const {results, ...p} = _searchedData;
        setPaginationData(p)
        setSearchedData(results)
    },[_searchError, _searchedData])

    useEffect(() => {
        if (error) handleAxiosError(error);
    }, [error]);

    const setMonthEndDate = (value: string) => {
        setMonthEndDateState(value);
        if (value !== "" && !isValidMonthEndDate(value)) {
            toast.error("Month end date must be between 1 and 31");
        }
    };

    const onSubmit = () =>{
        setMode("search");
        setDebounceSearch(searchValue)
    }

    const onClear = () =>{
        setSearchValue("")
        setDebounceSearch("")
        setMode("normal")
    }

    return {
        isError,
        loading: isLoading || _searchedLoading,
        monthEndDate,
        monthEndDateValid,
        data,
        currentYear,
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
        setSearchCategory,
    };
}

export default useBusinessReport;
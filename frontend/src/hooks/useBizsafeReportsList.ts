import { useState, type Dispatch, type SetStateAction } from "react";
import type { BizsafeReportSummaryResponse } from "@/types/core";

export type setBizsafeResultsType = Dispatch<SetStateAction<BizsafeReportSummaryResponse | null>>
function useBizsafeReportsList() {
    const [results, setResults] = useState<BizsafeReportSummaryResponse | null>(null)
    
    return {
        results,
        setResults
    }
}

export default useBizsafeReportsList

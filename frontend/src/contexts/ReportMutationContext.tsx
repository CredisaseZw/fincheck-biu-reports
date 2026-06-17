/* eslint-disable react-refresh/only-export-components */
import type { Report } from "@/types/core";
import { 
    createContext, 
    useState, 
    useContext,
    type ReactNode, 
    type Dispatch, 
    type SetStateAction 
} from "react";
interface ReportContextProps{
    showClientFields : boolean,
    report : Report | null,
    report_id?: number | null,
    reportLoading :  boolean
    setReport: Dispatch<SetStateAction<Report | null>>,
    setShowClientFields :Dispatch<SetStateAction<boolean>>
    setReportLoading :Dispatch<SetStateAction<boolean>>
}

const ReportContext = createContext<ReportContextProps | undefined>(undefined);
interface ReportProviderProps {
    children : ReactNode
}

function ReportProvider({children} : ReportProviderProps){
    const [showClientFields, setShowClientFields] = useState(false)
    const [report, setReport] = useState<Report | null>(null);
    const [reportLoading, setReportLoading] = useState(false);

    return (
        <ReportContext.Provider value={{
            report,
            reportLoading,
            showClientFields,
            report_id : report?.id,
            setShowClientFields,
            setReportLoading,
            setReport
        }}>
            {children}
        </ReportContext.Provider>
    )
}

export const useReport = () => {
    const context = useContext(ReportContext);
    if (!context) {
        throw new Error("useAuth should be used within an AuthProvider");
    }
    return context; 
}
export default ReportProvider
/* eslint-disable react-refresh/only-export-components */
import { 
    createContext, 
    useState, 
    useContext,
    type ReactNode, 
    type Dispatch, 
    type SetStateAction,
} from "react";
interface ReportContextProps{
    openCompanyFields : boolean,
    reportLoading : boolean,
    openIndividualFields : boolean,
    setOpenCompanyFields :Dispatch<SetStateAction<boolean>>
    setReportLoading :Dispatch<SetStateAction<boolean>>
    setOpenIndividualFields : Dispatch<SetStateAction<boolean>>
}

const ReportContext = createContext<ReportContextProps | undefined>(undefined);
interface ReportProviderProps {
    children : ReactNode
}

function ReportProvider({children} : ReportProviderProps){
    const [reportLoading, setReportLoading] = useState(false);
    const [openCompanyFields, setOpenCompanyFields] = useState(false)
    const [openIndividualFields, setOpenIndividualFields] = useState(false)

    return (
        <ReportContext.Provider value={{
            openCompanyFields,
            reportLoading,
            openIndividualFields,
            setOpenIndividualFields,
            setOpenCompanyFields,
            setReportLoading
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
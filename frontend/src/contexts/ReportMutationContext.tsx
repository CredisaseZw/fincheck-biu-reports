/* eslint-disable react-refresh/only-export-components */
import type { EntityMode, EntityValue, Report } from "@/types/core";
import { createContext, useState, useContext,  type ReactNode } from "react";
import { toast } from "sonner";


interface ReportContextProps{
    showClientFields : boolean,
    clientType : EntityValue,
    subjectType : EntityValue,
    report : Report | null,
    report_id?: number | null
    onUpdateEntityTypes : (entity : EntityMode, value: EntityValue) => void
    onSetEntityId : (entity : EntityMode, value: number) => void
    onEnterClientCreationMode : () => void
}

const ReportContext = createContext<ReportContextProps | undefined>(undefined);
interface ReportProviderProps {
    children : ReactNode

}

function ReportProvider({children} : ReportProviderProps){
    const [showClientFields, setShowClientFields] = useState(false)
    const [clientType, setClientType] = useState<EntityValue>("company")
    const [subjectType, setSubjectType] = useState<EntityValue>("company")
    const [clientObjectId, setClientObjectId] = useState<number | null>(null);
    const [subjectObjectId, setSubjectObjectId] = useState<number | null>(null);
    const [report, setReport] = useState<Report | null>(null);

    const onUpdateEntityTypes = ( entity :EntityMode, value: EntityValue)=>{
        if (entity === "client") {
            setClientType(value);
            return;
        }
        setSubjectType(value);
    }

    const onSetEntityId = (entity : EntityMode, value: number) => {
        if (entity === "client"){
            setClientObjectId(value)
            return;
        }
        setSubjectObjectId(value)
    }

    const onEnterClientCreationMode = () => {
        setShowClientFields(true)
        if(!subjectObjectId) {
            toast.info("Reminder", {description : "Subject has'nt been selected yet."})
            return;
        }
    }

    return (
        <ReportContext.Provider value={{
            report,
            clientType,
            subjectType,
            showClientFields,
            report_id : report?.id,
            onEnterClientCreationMode,
            onUpdateEntityTypes,
            onSetEntityId,
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
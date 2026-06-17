import { useReport } from '@/contexts/ReportMutationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import ColumnsContainer from './ColumnsContainer';
import type { EntityMode, EntityValue, Report } from '@/types/core';
import SearchEntity, { type SearchEntityRef } from './SearchEntity';
import { getCurrentDateFormatted, getFormattedDate, handleAxiosError } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import useCreateReport from '@/hooks/api/useCreateReport';
import { toast } from 'sonner';

function ReportHeader() {
    const { 
        setShowClientFields,
        setReportLoading, 
        setReport,
        report
    } = useReport();
    const [clientType, setClientType] = useState<EntityValue>("company")
    const [subjectType, setSubjectType] = useState<EntityValue>("company")
    const [clientObjectId, setClientObjectId] = useState<number | null>(null);
    const [subjectObjectId, setSubjectObjectId] = useState<number | null>(null);
    const { mutate } = useCreateReport();
    
    const subjectRef = useRef<SearchEntityRef>(null);    
    const clientRef = useRef<SearchEntityRef>(null);

    const onUpdateEntityTypes = ( entity :EntityMode, value: EntityValue)=>{
        if (entity === "client") {
            setClientType(value);
            return;
        }
        setSubjectType(value);
    }

    const onSetEntityId = (entity : EntityMode, value: number | null) => {
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
    useEffect(()=>{
        if(clientObjectId && subjectObjectId){
            setReportLoading(true);
            mutate({
                client_object_id : clientObjectId,
                client_type :  clientType,
                subject_object_id : subjectObjectId,
                subject_type : subjectType
            }, {
                onSuccess : (data: Report) => {
                    setReport(data)   
                },
                onError : (error) => handleAxiosError(error),
                onSettled :()=> setReportLoading(false)

            })
        }
    }, [
        clientType,
        clientObjectId,
        subjectObjectId,
        subjectType,
        mutate,
        setClientObjectId,
        setReportLoading,
        setReport
    ])

    return (
    <div className="w-full">
        <div className="border-b pb-5">
            <ColumnsContainer gapClass="gap-8">
                <div className="flex flex-col">
                    <h1 className="font-bold text-lg text-gray-800 dark:text-gray-200">Client Name</h1>
                    <div className="flex flex-row gap-3">
                        <Select 
                            value={clientType}
                            onValueChange={(val: EntityValue) =>{
                                onUpdateEntityTypes("client", val)
                                setReport(null)
                                clientRef.current?.clear()
                            }}>
                            <SelectTrigger
                                className="mt-2"
                            >
                                <SelectValue
                                placeholder = "Select item"></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="company">Company</SelectItem>
                                <SelectItem value="individual">Individual</SelectItem>
                            </SelectContent>
                        </Select>
                        <SearchEntity
                            ref={clientRef}
                            entityMode="client"
                            entityType={clientType}
                            onEnterClientCreationMode={onEnterClientCreationMode}
                            onSetEntityId={onSetEntityId}
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <h1 className="font-bold text-lg text-gray-800 dark:text-gray-200">Subjects Name</h1>
                    <div className="flex flex-row gap-3">
                        <Select
                            value={subjectType}
                            onValueChange={(val: EntityValue) =>{
                                onUpdateEntityTypes("subject", val);
                                setReport(null);
                                subjectRef.current?.clear();
                            }}>
                            <SelectTrigger
                                className="mt-2"
                            >
                                <SelectValue placeholder = "Select item"></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="company">Company</SelectItem>
                                <SelectItem value="individual">Individual</SelectItem>
                            </SelectContent>
                        </Select>
                        <SearchEntity
                            ref = {subjectRef}
                            entityMode="subject"
                            entityType={subjectType}
                            onSetEntityId={onSetEntityId}
                        />
                    </div>
                </div>
            </ColumnsContainer>
        </div>
        <div className="pt-5 flex flex-row justify-between">
            <div className="flex flex-col gap-1.5">
                <h6 className="font-semibold text-md text-gray-800 dark:text-gray-200">Enquiry Reference</h6>
                <span className="text-gray-700 dark:text-gray-100"> 
                    {
                        report ? report.enquiry_reference : "-"
                    }
                </span>
            </div>
            <div className="flex flex-col gap-1.5 text-end">
              <h6 className="font-semibold text-md text-gray-800 dark:text-gray-200">Report Date</h6>
                <span className="text-gray-700 dark:text-gray-100">{
                report?.created_at
                ? getFormattedDate(report.created_at)
                : getCurrentDateFormatted()}</span>
            </div>
        </div>
        
    </div>
  )
}

export default ReportHeader
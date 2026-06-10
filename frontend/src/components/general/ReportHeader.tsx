import { useReport } from '@/contexts/ReportMutationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import ColumnsContainer from './ColumnsContainer';
import type { EntityValue } from '@/types/core';
import SearchEntity, { type SearchEntityRef } from './SearchEntity';
import { getCurrentDateFormatted } from '@/lib/utils';
import { useRef } from 'react';

function ReportHeader() {
    const { onUpdateEntityTypes, setReport, clientType, subjectType, report } = useReport();
    const subjectRef = useRef<SearchEntityRef>(null);    
    const clientRef = useRef<SearchEntityRef>(null);

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
                <span className="text-gray-700 dark:text-gray-100">{getCurrentDateFormatted()}</span>
            </div>
        </div>
        
    </div>
  )
}

export default ReportHeader
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import ColumnsContainer from './ColumnsContainer';
import type { DefaultHeaderProps, EntityMode, EntityValue, onSelectEntityProps } from '@/types/core';
import SearchEntity, { type SearchEntityRef } from './SearchEntity';
import { getCurrentDateFormatted, getFormattedDate } from '@/lib/utils';
import { useRef, type Dispatch, type SetStateAction } from 'react';
import { Input } from '../ui/input';
interface props{
    clientType : EntityValue,
    subjectType : EntityValue    
    username : string,
    default_header : DefaultHeaderProps | undefined,
    SubjectUniqueID : string | undefined | null
    onSelectEntity : (entity : EntityMode, props:onSelectEntityProps) => void
    setSubjectUniqueID: (value: SetStateAction<string | undefined | null>) => void
    onUpdateEntityTypes : (entity :EntityMode, value: EntityValue)=> void
    onSetEntityId : (entity : EntityMode, value: number | null) => void
    setUsername:Dispatch<SetStateAction<string>>
}

function ReportHeaderForm({ 
    default_header, 
    clientType,
    subjectType,
    SubjectUniqueID,
    username,
    onSelectEntity,
    setSubjectUniqueID,
    setUsername,
    onSetEntityId,
    onUpdateEntityTypes
}: props) {
    const subjectRef = useRef<SearchEntityRef>(null);    
    const clientRef = useRef<SearchEntityRef>(null);

    return (
    <div className="w-full">
        <div className="border-b pb-5 flex flex-col gap-6">
            <ColumnsContainer gapClass="gap-5">
                <div className="flex flex-col">
                    <h1 className="font-bold text-lg text-gray-800 dark:text-gray-200">Client Name</h1>
                    <div className="flex flex-row gap-3">
                        <Select 
                            value={clientType}
                            onValueChange={(val: EntityValue) =>{
                                onUpdateEntityTypes("client", val)
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
                            defaultSearch={default_header?.client_default_search ?? ""}
                            entityMode="client"
                            entityType={clientType}
                            onSelectEntity={onSelectEntity}
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
                            defaultSearch= {default_header?.subject_default_search ?? ""}
                            entityMode="subject"
                            entityType={subjectType}
                            onSelectEntity={onSelectEntity}
                            onSetEntityId={onSetEntityId}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <h1 className="font-bold text-lg text-gray-800 dark:text-gray-200">Subject's {subjectType === "company" ? "Company Reg No" : "National ID"}</h1>
                    <Input
                        value={SubjectUniqueID ?? ""}
                        onChange={(e)=> setSubjectUniqueID(e.target.value)}
                        placeholder = {subjectType === "company" ? "e.g 123/56" : "e.g 632178595M21"}
                    />
                </div>
                <div className="form-group">
                    <h1 className="font-bold text-lg text-gray-800 dark:text-gray-200">Requestor Name</h1>
                    <Input
                        value={username}
                        onChange={(e)=> setUsername(e.target.value)}
                        placeholder = "e.g John Doe"
                    />
                </div>
            </ColumnsContainer>
        </div>
        <div className="pt-5 flex flex-row justify-between">
            <div className="flex flex-col gap-1.5">
                <h6 className="font-semibold text-md text-gray-800 dark:text-gray-200">Enquiry Reference</h6>
                <span className="text-gray-700 dark:text-gray-100"> 
                    { default_header?.enquiry_reference ?? "-" }
                </span>
            </div>
            <div className="flex flex-col gap-1.5 text-end">
              <h6 className="font-semibold text-md text-gray-800 dark:text-gray-200">Report Date</h6>
                <span className="text-gray-700 dark:text-gray-100">{
                default_header?.created_at
                ? getFormattedDate(default_header.created_at)
                : getCurrentDateFormatted()}</span>
            </div>
        </div>
        
    </div>
  )
}

export default ReportHeaderForm
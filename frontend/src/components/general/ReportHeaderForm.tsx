import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import ColumnsContainer from './ColumnsContainer';
import type { DefaultHeaderProps, EntityMode, EntityValue, onSelectEntityProps } from '@/types/core';
import SearchEntity, { type SearchEntityRef } from './SearchEntity';
import { useRef, type Dispatch, type SetStateAction } from 'react';
import { Input } from '../ui/input';
interface props{
    clientType : EntityValue,
    subjectType : EntityValue    
    username : string,
    contactPerson: string
    default_header : DefaultHeaderProps | undefined,
    createdAt: string
    onSelectEntity : (entity : EntityMode, props:onSelectEntityProps) => void
    onUpdateEntityTypes : (entity :EntityMode, value: EntityValue)=> void
    onSetEntityId : (entity : EntityMode, value: number | null) => void
    setUsername:Dispatch<SetStateAction<string>>
    setContactPerson: Dispatch<SetStateAction<string>>
    setCreatedAt: Dispatch<SetStateAction<string>>
}

function ReportHeaderForm({ 
    default_header, 
    clientType,
    subjectType,
    username,
    contactPerson,
    createdAt,
    setCreatedAt,
    setContactPerson,
    onSelectEntity,
    setUsername,
    onSetEntityId,
    onUpdateEntityTypes
}: props) {
    const subjectRef = useRef<SearchEntityRef>(null);    
    const clientRef = useRef<SearchEntityRef>(null);

    return (
    <div className="w-full">
        <div className="pb-5 flex flex-col gap-6">
            <ColumnsContainer gapClass="gap-5">
                <div className="flex flex-col">
                    <h1 className="font-semibold text-base text-gray-800 dark:text-gray-200">Client Name</h1>
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
                    <h1 className="font-semibold text-base text-gray-800 dark:text-gray-200">Subjects Name</h1>
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
            </ColumnsContainer>
            <ColumnsContainer numberOfCols={3}>
                <div className="form-group">
                    <h1 className="font-semibold text-base text-gray-800 dark:text-gray-200">Requestor Name</h1>
                    <Input
                        value={username}
                        onChange={(e)=> setUsername(e.target.value)}
                        placeholder = "e.g John Doe"
                    />
                </div>
                <div className="form-group">
                    <h1 className="font-semibold text-base text-gray-800 dark:text-gray-200">Contact Person</h1>
                    <Input
                        value={contactPerson}
                        onChange={(e)=> setContactPerson(e.target.value)}
                        placeholder = "e.g John Doe"
                    />
                </div>
                <div className="form-group">
                    <h1 className="font-semibold text-base text-gray-800 dark:text-gray-200">Report Creation date</h1>
                    <Input
                        type = {"datetime-local"}
                        value={createdAt}
                        onChange={(e)=> setCreatedAt(e.target.value)}
                    />
                </div>
            </ColumnsContainer>
        </div>

        
    </div>
  )
}

export default ReportHeaderForm
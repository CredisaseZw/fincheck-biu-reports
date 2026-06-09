import { useReport } from '@/contexts/ReportMutationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import ColumnsContainer from './ColumnsContainer';
import type { EntityValue } from '@/types/core';

function ReportHeader() {
    const { onUpdateEntityTypes, clientType, subjectType } = useReport();
    return (
    <div className="w-full">
        <div className="border-b ">
            <ColumnsContainer>
                <div>
                    <Select 
                        value={clientType}
                        onValueChange={(val: EntityValue) =>{
                            onUpdateEntityTypes("client", val)
                        }}>
                        <SelectTrigger>
                            <SelectValue placeholder = "Select item"></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="individual">Individual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Select
                        value={subjectType}
                        onValueChange={(val: EntityValue) =>{
                            onUpdateEntityTypes("subject", val)
                        }}>
                        <SelectTrigger>
                            <SelectValue placeholder = "Select item"></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="individual">Individual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
            </ColumnsContainer>
        </div>
        
    </div>
  )
}

export default ReportHeader
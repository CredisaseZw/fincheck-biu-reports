import { Select,SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface props {
    onChange : any,
    defaultValue : string 
}
function RecordDebtorSelector({onChange, defaultValue} :props ) {
  return (
    <Select onValueChange={onChange} defaultValue={defaultValue}>
        <SelectTrigger className="w-30.25 self-center">
            <SelectValue placeholder="Select gender" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
        </SelectContent>
    </Select>  )
}

export default RecordDebtorSelector
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import LoadingIndicator from './LoadingIndicator';
import { Check } from 'lucide-react';

interface props {
    label?: string 
    isPending?: boolean
    state?: boolean
    showFine?: boolean
    onFine?: ()=>void
}

function CustomSubmitButton({
        label = "Update",
        isPending,
        showFine, 
        onFine,
        state
    }:props) {
    return (
        <div className="flex flex-1 justify-end gap-3">
            {
                showFine && !state &&
                <Button variant={"outline"} type="button" onClick={onFine}>
                    <Check/>
                    Fine
                </Button>
            }
            <Button
                className={
                    cn(
                        "self-end text-gray-200",
                        isPending ? "cursor-not-allowed" : "",
                        state ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"
                    )
                }
                disabled = {isPending}
                type="submit"

            >
                {
                    isPending && 
                    <LoadingIndicator variant="button"/>
                }
                {label}
            </Button>
        </div>
  
  )
}

export default CustomSubmitButton

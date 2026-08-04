import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import LoadingIndicator from './LoadingIndicator';

interface props {
    label?: string 
    isPending?: boolean
    state?: boolean
}

function CustomSubmitButton({
        label = "Update",
        isPending, 
        state
    }:props) {
    return (
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
  )
}

export default CustomSubmitButton

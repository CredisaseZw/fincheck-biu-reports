import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import LoadingIndicator from './LoadingIndicator';

interface props { 
    isPending?: boolean
    state?: "touched" | "untouched" 
}

function CustomSubmitButton({isPending, state}:props) {
  return (
    <Button

        className={
            cn(
                "self-end",
                isPending ? "cursor-not-allowed" : "",
                state === "touched" ? "bg-green-500 hover:bg-green-600" : ""
            )
        }
        disabled = {isPending}
        type="submit"

    >
        {
            isPending && 
            <LoadingIndicator variant="button"/>
        }
        Update
    </Button>
  )
}

export default CustomSubmitButton
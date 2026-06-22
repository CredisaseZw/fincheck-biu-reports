import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import LoadingIndicator from './LoadingIndicator';

interface props { 
    isPending?: boolean
}

function CustomSubmitButton({isPending}:props) {
  return (
    <Button
        className={
            cn(
                "self-end",
                isPending ? "cursor-not-allowed" : "" 
            )
        }
        disabled = {isPending}
        type="submit"

    >
        {
            isPending && 
            <LoadingIndicator variant="button"/>
        }
        Submit
    </Button>
  )
}

export default CustomSubmitButton
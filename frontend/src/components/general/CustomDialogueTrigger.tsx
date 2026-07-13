import { Edit, type LucideIcon } from 'lucide-react';
import { DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { OptionButton } from './OptionButton';

interface props {
    Icon?: LucideIcon,
    mode: "create" | "update",
    label: string,
    editLabel?: string
}
function CustomDialogueTrigger({
    Icon,
    label,
    mode,
    editLabel = "Edit Report"
}: props) {
    return (
    <DialogTrigger className="self-center">
        {
            mode === "create"
            ? <Button>
                {Icon && <Icon/>}
                {label}
            </Button>
            : <OptionButton
                fullWidth
                variant={"ghost"}
                Icon={Edit}
                label= {editLabel}
            />
        }
    </DialogTrigger>
)
}

export default CustomDialogueTrigger
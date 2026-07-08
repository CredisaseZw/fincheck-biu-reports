import { Edit, type LucideIcon } from 'lucide-react';
import { DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { OptionButton } from './OptionButton';

interface props {
    Icon?: LucideIcon,
    mode: "create" | "update",
    label: string
}
function CustomDialogueTrigger({Icon, label, mode}: props) {
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
                label= {"Edit Report"}
            />
        }
    </DialogTrigger>
)
}

export default CustomDialogueTrigger
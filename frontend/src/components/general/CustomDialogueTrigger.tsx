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
    <DialogTrigger>
        {
            mode === "create"
            ? <Button>
                {Icon && <Icon/>}
                {label}
            </Button>
            : <OptionButton
                Icon={Edit}
                label= {"Edit Report"}
            />
        }
    </DialogTrigger>
)
}

export default CustomDialogueTrigger
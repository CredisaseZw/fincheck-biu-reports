import { DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
interface props{
    title?: string
    desc?: string
}
function CustomDialogueHeader({
    title, 
    desc = "Enter the required fields and save."}:props) {
  return (
    <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{desc}</DialogDescription>
    </DialogHeader>
)
}

export default CustomDialogueHeader
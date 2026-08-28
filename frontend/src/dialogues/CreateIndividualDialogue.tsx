import CustomDialogueHeader from "@/components/general/CustomDialogueHeader";
import IndividualDetails from "@/components/general/IndividualDetails";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useReport } from "@/contexts/ReportMutationContext";
import { Plus } from "lucide-react";

interface props { trigger?: boolean }

function CreateIndividualDialogue({trigger}:props) {
    const {
        openIndividualFields,
        setOpenIndividualFields
    } = useReport()
    return (
    <Dialog
        open = {openIndividualFields}
        onOpenChange={setOpenIndividualFields}
    >
        {
            trigger &&
            <DialogTrigger>
                <Button>
                    <Plus/>
                    Add Individual
                </Button>
            </DialogTrigger>
        }
        <DialogContent className="md:max-w-275 max-h-[90vh] overflow-y-auto">
            <CustomDialogueHeader title="Add Individual"/>
            <IndividualDetails/>
             <DialogFooter>
                <DialogClose>
                    <Button>Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>

  )
}

export default CreateIndividualDialogue
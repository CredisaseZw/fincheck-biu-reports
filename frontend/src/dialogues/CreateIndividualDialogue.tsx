import CustomDialogueHeader from "@/components/general/CustomDialogueHeader";
import IndividualDetails from "@/components/general/IndividualDetails";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useReport } from "@/contexts/ReportMutationContext";

function CreateIndividualDialogue() {
    const {
        openIndividualFields,
        setOpenIndividualFields
    } = useReport()
    return (
    <Dialog
        open = {openIndividualFields}
        onOpenChange={setOpenIndividualFields}
    >
        <DialogContent className="md:max-w-275 max-h-[90vh] overflow-y-auto">
            <CustomDialogueHeader title="Add Individual"/>
            <IndividualDetails/>
        </DialogContent>
    </Dialog>

  )
}

export default CreateIndividualDialogue
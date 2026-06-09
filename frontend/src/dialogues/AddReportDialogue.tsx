import CustomDialogueHeader from "@/components/general/CustomDialogueHeader";
import CustomDialogueTrigger from "@/components/general/CustomDialogueTrigger";
import ReportHeader from "@/components/general/ReportHeader";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Printer } from "lucide-react";

interface props {
    report?: Report
}
function AddReportDialogue({report} :props) {
    return (
    <Dialog>
        <CustomDialogueTrigger
            mode= {!report ? "create" : "update"}
            Icon= {Plus}
            label="Add Report"
        />
        <DialogContent className="md:max-w-250 max-h-[90vh] overflow-y-auto">
            <CustomDialogueHeader
                title={
                    report
                    ? "Edit report information"
                    : "Create a new report"
                }
            />
            <ReportHeader/>
            
            <DialogFooter>
                <DialogClose>
                    <Button variant={"ghost"}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button>
                    <Printer/>
                    Print 
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
)
}

export default AddReportDialogue
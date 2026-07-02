import CompanyDetails from "@/components/general/CompanyDetails";
import CustomDialogueHeader from "@/components/general/CustomDialogueHeader";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useReport } from "@/contexts/ReportMutationContext";

function CreateCompanyDialogue() {
    const {
        openCompanyFields, 
        setOpenCompanyFields
    } = useReport()
    return (
        <Dialog 
            open = {openCompanyFields} 
            onOpenChange={setOpenCompanyFields}
        >
            <DialogContent className="max-h-[90vh] md:max-w-275 overflow-y-auto">
                <CustomDialogueHeader title="Create Company"/>
                <CompanyDetails
                    subject_type={null}
                />        
            </DialogContent>
        </Dialog>
    )
}

export default CreateCompanyDialogue
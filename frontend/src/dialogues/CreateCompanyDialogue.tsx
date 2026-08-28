import CompanyDetails from "@/components/general/CompanyDetails";
import CustomDialogueHeader from "@/components/general/CustomDialogueHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useReport } from "@/contexts/ReportMutationContext";
import { Plus } from "lucide-react";

interface props { trigger?: boolean }

function CreateCompanyDialogue({trigger}:props) {
    const {
        openCompanyFields, 
        setOpenCompanyFields
    } = useReport()
    return (
        <Dialog 
            open = {openCompanyFields} 
            onOpenChange={setOpenCompanyFields}
        >   
        {
            trigger &&
            <DialogTrigger>
                <Button>
                    <Plus/>
                    Add Company
                </Button>
            </DialogTrigger>
        }
            <DialogContent className="max-h-[90vh] md:max-w-275 overflow-y-auto">
                <CustomDialogueHeader title="Add Company"/>
                <CompanyDetails
                    subject_type={null}
                />        
                <DialogFooter>
                    <DialogClose>
                        <Button>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateCompanyDialogue
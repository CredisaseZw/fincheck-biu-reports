import NextOfKin from "@/components/general/NextOfKin"
import CompanyDetails from "@/components/general/CompanyDetails";
import CompanyOperations from "@/components/general/CompanyOperations";
import CompanyStructure from "@/components/general/CompanyStructure";
import CustomDialogueHeader from "@/components/general/CustomDialogueHeader";
import CustomDialogueTrigger from "@/components/general/CustomDialogueTrigger";
import EmploymentInformation from "@/components/general/EmploymentInformation";
import IndividualDetails from "@/components/general/IndividualDetails";
import ReportHeader from "@/components/general/ReportHeader";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Printer } from "lucide-react";
import BankerDetails from "@/components/general/BankersDetails";
import ProfessionalPartnersDetails from "@/components/general/ProfessionalPartnersDetails";
import RegistrationAccountsDetails from "@/components/general/RegistrationAccountsDetails";
import FinancialsDetails from "@/components/general/FinancialsDetails";
import ShareholdingDetails from "@/components/general/ShareholdingDetails";
import DirectorDetails from "@/components/general/DirectorDetails";
import ClaimsDetails from "@/components/general/ClaimsDetails";
import CourtDetails from "@/components/general/CourtDetails";
import AbsconderDetails from "@/components/general/AbsconderDetails"
import InsolvencyRecordsDetails from "@/components/general/InsolvencyRecordsDetails";
import TradeReferencesDetails from "@/components/general/TradeReferencesDetails";
import useAddReportDialogue from "@/hooks/useAddReportDialogue";
import type { ListReport } from "@/types/core";
import { useReport } from "@/contexts/ReportMutationContext";
import { FormSkeleton } from "@/components/general/Skeletons";

interface props {
    report_item?: ListReport
}

function AddReportDialogue({ report_item }: props) {
    const { open, setOpen, isLoading } = useAddReportDialogue(report_item)
    const { report, reportLoading } = useReport()


    const isUpdating = !!report_item;
    const showSkeleton = reportLoading || (isUpdating && isLoading);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <CustomDialogueTrigger
                mode={!report_item ? "create" : "update"}
                Icon={Plus}
                label="Add Report"
            />
            <DialogContent className="md:max-w-332 max-h-[95vh] overflow-y-auto">
                <CustomDialogueHeader
                    title={report ? "Edit report information" : "Create a new report"}
                />

                <ReportHeader />

                {showSkeleton
                    ? <FormSkeleton />
                    : report?.client_type === "company"
                        ? <>
                            <CompanyDetails />
                            <CompanyStructure />
                            <CompanyOperations />
                        </>
                        : report?.client_type === "individual"
                            ? <>
                                <IndividualDetails />
                                <EmploymentInformation />
                                <NextOfKin />
                            </>
                            : null
                }

                {showSkeleton
                    ? <FormSkeleton />
                    : report &&
                         <>
                            <BankerDetails />
                            <ProfessionalPartnersDetails />
                            <RegistrationAccountsDetails />
                            <FinancialsDetails />
                            <ShareholdingDetails />
                            <DirectorDetails />
                            <ClaimsDetails />
                            <AbsconderDetails />
                            <CourtDetails />
                            <InsolvencyRecordsDetails />
                            <TradeReferencesDetails />
                        </>
                        
                }

                <DialogFooter>
                    <DialogClose>
                        <Button variant={"ghost"}>Cancel</Button>
                    </DialogClose>
                    <Button>
                        <Printer />
                        Print
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddReportDialogue
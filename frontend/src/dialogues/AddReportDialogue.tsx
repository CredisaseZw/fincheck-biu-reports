import NextOfKin from "@/components/general/NextOfKin"
import CompanyDetails from "@/components/general/CompanyDetails";
import CompanyOperations from "@/components/general/CompanyOperations";
import CompanyStructure from "@/components/general/CompanyStructure";
import CustomDialogueHeader from "@/components/general/CustomDialogueHeader";
import CustomDialogueTrigger from "@/components/general/CustomDialogueTrigger";
import EmploymentInformation from "@/components/general/EmploymentInformation";
import IndividualDetails from "@/components/general/IndividualDetails";
import ReportHeaderForm from "@/components/general/ReportHeaderForm";
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
import Fieldset from "@/components/general/FieldSet";
import ReportHeaderCard from "@/components/general/ReportHeaderCard";

interface props {
    report_item?: ListReport
}

function AddReportDialogue({ report_item }: props) {
    const { 
        individualDetails,
        companyOverview,
        defaultHeader,
        isLoading, 
        report,
        open, 
        clientType,
        subjectType,
        headerEditMode,
        onClear,
        onEdit,
        setOpen,
        onSetEntityId,
        onUpdateEntityTypes,
    } = useAddReportDialogue(report_item)
    const { reportLoading } = useReport()

    const isUpdating = !!report_item;
    const showSkeleton = reportLoading || (isUpdating && isLoading);
    
    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) { onClear() }
        setOpen(isOpen);
    };
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <CustomDialogueTrigger
                mode={isUpdating ? "update" : "create"}
                Icon={Plus}
                label="Add Report"
            />
            <DialogContent className="md:max-w-332 max-h-[95vh] overflow-y-auto">
                <CustomDialogueHeader
                    title={report_item ? "Edit report information" : "Create a new report"}
                />
                {
                   headerEditMode 
                   ? <ReportHeaderForm 
                        default_header={defaultHeader}
                        clientType={clientType}
                        subjectType={subjectType}
                        onSetEntityId={onSetEntityId}
                        onUpdateEntityTypes={onUpdateEntityTypes}
                    />
                    : <ReportHeaderCard
                        onEdit={onEdit}
                        default_header={defaultHeader}
                    />
                }
                
                {showSkeleton
                    ? <FormSkeleton />
                    : report ? 
                        clientType === "company"
                        ? <>
                            <CompanyDetails
                                company_overview = {companyOverview}
                            />
                            <CompanyStructure />
                            <CompanyOperations />
                        </>
                        : clientType === "individual"
                            ? <>
                                <IndividualDetails 
                                    individual_details={individualDetails}
                                />
                                <EmploymentInformation />
                                <NextOfKin />
                            </>
                            : null
                        : null
                        }

                {showSkeleton
                    ? <FormSkeleton />
                    : report &&
                    <>
                        {/* REPORT SUMMARY */}

                        <Fieldset legendTitle="Credit Records">
                            <ClaimsDetails />
                            <AbsconderDetails />
                            <CourtDetails />
                            <InsolvencyRecordsDetails />
                        
                            {/* PUBLIC INFORMATION */}
                        
                        </Fieldset>
                        {
                            clientType === "company" &&
                            <>
                                <DirectorDetails />             
                                <ShareholdingDetails />
                            </>
                        }
                        <FinancialsDetails />
                        <TradeReferencesDetails />
                        <RegistrationAccountsDetails />
                        <BankerDetails />
                        <ProfessionalPartnersDetails />
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
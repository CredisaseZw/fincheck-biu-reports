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
        subject_object_id,
        subject_type,
        individualDetails,
        companyOverview,
        employmentInformation,
        courtJudgements,
        defaultHeader,
        isLoading, 
        nextOfKin,
        absconders,
        insolvencyRecords,
        report,
        claims,
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
    const {
        reportLoading,
    } = useReport()

    const isUpdating = !!report_item;
    const showSkeleton = reportLoading || (isUpdating && isLoading);

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) { onClear() }
        setOpen(isOpen);
    };

    return (
        <div className="relative">
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
                            subjectType === "company"
                            ? <>
                                <CompanyDetails
                                    subject_type= {subject_type}
                                    company_overview = {companyOverview}
                                    report_id={report.id}
                                />
                                <CompanyStructure />
                                <CompanyOperations />
                            </>
                            : subjectType === "individual"
                                ? <>
                                    <IndividualDetails 
                                        report_id={report.id}
                                        individual_details={individualDetails}
                                    />
                                    <EmploymentInformation 
                                        employment_information = {employmentInformation}
                                        report_id={report.id}
                                        subject_type= {subject_type}
                                    />
                                    <NextOfKin 
                                        subject_type={subject_type}
                                        next_of_kin={nextOfKin}
                                        report_id={report.id}
                                    />
                                </>
                                : null
                            : null
                            }

                    {showSkeleton
                        ? <FormSkeleton />
                        : report &&
                        <>
                            {/* REPORT SUMMARY */}
                            {
                                subjectType === "company" &&
                                <>
                                    <DirectorDetails />             
                                    <ShareholdingDetails />
                                </>
                            }
                            <BankerDetails />
                            <Fieldset legendTitle="Credit Records">
                                <ClaimsDetails
                                    claims_data = {claims}
                                    report_id={report.id}
                                    subject_object_id = {subject_object_id}
                                    subject_type = {subject_type}
                                />
                                <AbsconderDetails
                                    absconders_data={absconders}
                                    report_id={report.id}
                                    subject_object_id = {subject_object_id}
                                    subject_type = {subject_type}
                                />
                                <CourtDetails
                                    court_judgements_data={courtJudgements}
                                    report_id={report.id}
                                    subject_object_id = {subject_object_id}
                                    subject_type = {subject_type}
                                />
                                <InsolvencyRecordsDetails
                                    insolvency_data={insolvencyRecords} 
                                    report_id={report.id}
                                    subject_object_id = {subject_object_id}
                                    subject_type = {subject_type}
                                />
                                {/* PUBLIC INFORMATION */}       
                            </Fieldset>

                            <TradeReferencesDetails />
                            <FinancialsDetails />
                            <RegistrationAccountsDetails />
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
        </div>
    )
}

export default AddReportDialogue
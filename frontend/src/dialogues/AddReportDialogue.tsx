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
import { Plus } from "lucide-react";
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
import PublicInformationDetails from "@/components/general/PublicInformationDetails";
import TradeReferencesDetails from "@/components/general/TradeReferencesDetails";
import useAddReportDialogue from "@/hooks/useAddReportDialogue";
import type { ListReport } from "@/types/core";
import { useReport } from "@/contexts/ReportMutationContext";
import { FormSkeleton } from "@/components/general/Skeletons";
import Fieldset from "@/components/general/FieldSet";
import ReportHeaderCard from "@/components/general/ReportHeaderCard";
import LoadingIndicator from "@/components/general/LoadingIndicator";
import ReportDetails from "@/components/general/ReportDetails";
import FinalizedReportDialog from "./FinalizedReportDialogue";

interface props {
    report_item?: ListReport
}

function AddReportDialogue({ report_item }: props) {
    const { 
        subject_object_id,
        subject_type,
        reportDetails,
        individualDetails,
        companyOverview,
        employmentInformation,
        courtJudgements,
        companyStructure,
        tradeReferences,
        defaultHeader,
        isLoading, 
        directors,
        companyOperations,
        professionals,
        nextOfKin,
        absconders,
        insolvencyRecords,
        publicInformation,
        report,
        bankerDetails,
        claims,
        open, 
        clientType,
        accounts,
        subjectType,
        financials,
        headerEditMode,
        shareholding,
        onClear,
        onEdit,
        generateReport,
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
                                <CompanyStructure 
                                    structure_data = {companyStructure}
                                    report_id={report.id}
                                    subject_object_id = {subject_object_id}
                                    subject_type = {subject_type}
                                />
                                <CompanyOperations 
                                    operations_data = {companyOperations}
                                    report_id={report.id}
                                    subject_object_id = {subject_object_id}
                                    subject_type = {subject_type}
                                />
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
                                    <DirectorDetails 
                                        directors_data={directors}
                                        report_id={report.id}
                                        subject_object_id = {subject_object_id}
                                        subject_type = {subject_type}
                                    />             
                                    <ShareholdingDetails
                                        shareholdings_data = {shareholding}
                                        report_id={report.id}
                                        subject_object_id = {subject_object_id}
                                        subject_type = {subject_type}
                                    />
                                </>
                            }
                            <BankerDetails 
                                banker_accounts={bankerDetails}
                                report_id={report.id}
                                subject_object_id = {subject_object_id}
                                subject_type = {subject_type}
                            />
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
                                <PublicInformationDetails
                                    public_information_data={publicInformation}
                                    report_id={report.id}
                                    subject_object_id={subject_object_id}
                                    subject_type={subject_type}
                                />
                            </Fieldset>

                            <TradeReferencesDetails 
                                trade_references_data={tradeReferences}
                                report_id={report.id}
                                subject_object_id={subject_object_id}
                                subject_type={subject_type}
                            />
                            <FinancialsDetails 
                                financials_data={financials}
                                report_id={report.id}
                                subject_object_id={subject_object_id}
                                subject_type={subject_type}
                            />
                            <RegistrationAccountsDetails
                                accounts_data={accounts}
                                report_id={report.id}
                                subject_object_id={subject_object_id}
                                subject_type={subject_type} 
                            />
                            <ProfessionalPartnersDetails
                                professionals_data={professionals}
                                report_id={report.id}
                                subject_object_id={subject_object_id}
                                subject_type={subject_type}
                            />
                            <ReportDetails
                                report_data={reportDetails}
                                report_id={report.id}
                                subject_object_id = {subject_object_id}
                                subject_type = {subject_type}
                            />
                        </>    
                    }

                    <DialogFooter>
                        <DialogClose>
                            <Button variant={"ghost"}>Cancel</Button>
                        </DialogClose>
                        {
                            (!report &&
                            !report_item &&
                            headerEditMode) ?
                            <Button 
                                className={reportLoading ? "cursor-not-allowed" : "cursor-pointer"}
                                disabled = {reportLoading}
                                onClick={generateReport}
                            >
                                {
                                    reportLoading 
                                    ? <LoadingIndicator variant="button"/>
                                    : <Plus/>
                                }   
                                Generate Report
                            </Button>
                            : report &&
                            <FinalizedReportDialog main id ={report.id} /> /* MAKE A HOOK FOR THIS */
                        }
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddReportDialogue
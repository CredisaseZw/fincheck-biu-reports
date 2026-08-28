import useReportExtras from "@/hooks/useReportExtras";
import type { ReportExtrasProps } from "@/types/core";
import Fieldset from "./FieldSet";
import ColumnsContainer from "./ColumnsContainer";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import CustomSubmitButton from "./CustomSubmitButton";

function ReportExtras({
    report_extras, 
    report_id,
    subject_type
}:ReportExtrasProps) {
    const {
        handleSubmit,
        onSubmit,
        onTouched,
        register,
        touched,
        isPending,
        errors
    } = useReportExtras({
        report_extras, 
        report_id,
        subject_type
    })
    return (
        <Fieldset legendTitle="Report Extras">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                <ColumnsContainer numberOfCols={1}>
                    <div className="form-group">    
                        <Label>Contact Person</Label>
                        <Input
                            placeholder="e.g John Doe"
                            {...register("contact_person")}
                        />
                        {
                            errors.contact_person &&
                            <p className="text-destructive text-sm">{errors.contact_person.message}</p>
                        }
                    </div>
                    {/* <div className="form-group">    
                        <Label>Report Creation Date</Label>
                        <Input
                            type={"datetime-local"}
                            {...register("report_date")}
                        />
                        {
                            errors.report_date &&
                            <p className="text-destructive text-sm">{errors.report_date.message}</p>
                        }
                    </div> */}
                </ColumnsContainer>
                <CustomSubmitButton
                    onFine={onTouched}
                    state = {touched}
                    showFine
                    isPending ={isPending}
                />
            </form>
        </Fieldset>
    )
}

export default ReportExtras
import Fieldset from "./FieldSet";
import useReportDetails from "@/hooks/useReportDetails";
import type { ReportDetailsProps } from "@/types/core";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import CustomSubmitButton from "./CustomSubmitButton";

function ReportDetails({
    subject_object_id,
    subject_type,
    report_data,
    report_id
}:ReportDetailsProps) {
    const {
        touched,
        isPending,
        errors,
        register,
        handleSubmit,
        onSubmit
    } = useReportDetails({    
        subject_object_id,
        subject_type,
        report_data,
        report_id
    })
    return (
    <Fieldset legendTitle="Report Details">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <div className="form-group">
                <Label>Overall Risk Rating</Label>
                <Input
                    {
                        ...register("overall_risk_rating")
                    }
                    placeholder="e.g 3A2"
                />
                {
                    errors.overall_risk_rating &&
                    <p className="text-destructive text-sm">{errors.overall_risk_rating.message}</p>
                }
            </div>
            <Textarea
            { ...register("summary") } 
            placeholder="Summary ..."/>
            {
                errors.summary &&
                <p className="text-destructive text-sm">{errors.summary.message}</p>
            }
            <CustomSubmitButton
                        state={touched}
                        isPending={isPending}
                    />
        </form>
    </Fieldset>
  )
}

export default ReportDetails
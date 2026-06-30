import { ArrowUp } from "lucide-react";
import ColumnsContainer from "./ColumnsContainer";
import Fieldset from "./FieldSet";
import useReportDetails from "@/hooks/useReportDetails";
import type { ReportDetailsProps } from "@/types/core";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { numericField } from "@/hooks/useFinancialsDetails";
import { Textarea } from "../ui/textarea";
import CustomSubmitButton from "./CustomSubmitButton";

function ReportDetails({
    subject_object_id,
    subject_type,
    report_data,
    report_id
}:ReportDetailsProps) {
    const {
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
            <div className="w-full">
                <ColumnsContainer numberOfCols={4}>
                    <div className="bg-green-500 py-2 rounded-md text-white text-center flex flex-col gap-1">
                        <span className="text-xs">0 - 100</span>
                        <span className="text-md font-bold uppercase">Safe</span>
                    </div>
                    <div className="bg-orange-500 py-2 rounded-md text-white text-center flex flex-col gap-1">
                        <span className="text-xs">100 - 220</span>
                        <span className="text-md font-bold uppercase">Medium</span>
                    </div>
                    <div className="bg-pink-500 py-2 rounded-md text-white text-center flex flex-col gap-1">
                        <span className="text-xs">221 - 500</span>
                        <span className="text-md font-bold uppercase">High</span>
                    </div>
                    <div className="bg-red-600 py-2 rounded-md text-white text-center flex flex-col gap-1">
                        <span className="text-xs flex flex-row items-center justify-center">501 - <ArrowUp size={15}/></span>
                        <span className="text-md font-bold uppercase">High HIGH RISK</span>
                    </div>
                </ColumnsContainer>
            </div>
            <div className="form-group">
                <Label>Overall Risk Rating</Label>
                <Input
                    type="number"
                    {
                        ...register("overall_risk_rating", numericField)
                    }
                    placeholder="e.g 500"
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
            <CustomSubmitButton isPending = {isPending}/>
        </form>
    </Fieldset>
  )
}

export default ReportDetails
import useReportExtras, { OCCURRENCE_OPTIONS, REPORT_REASONS_OPTIONS } from "@/hooks/useReportExtras";
import type { ReportExtrasProps } from "@/types/core";
import Fieldset from "./FieldSet";
import ColumnsContainer from "./ColumnsContainer";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import CustomSubmitButton from "./CustomSubmitButton";
import { Textarea } from "../ui/textarea";
import { Controller } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { toCap } from "@/lib/utils";
import { CURRENCY_OPTIONS, numericField } from "@/constants";

function ReportExtras({
    report_extras,
    report_id,
    subject_type,
}: ReportExtrasProps) {
    const {
        handleSubmit,
        onSubmit,
        onTouched,
        register,
        getValues,
        touched,
        control,
        isPending,
        errors,
    } = useReportExtras({
        report_extras,
        report_id,
        subject_type,
    });

    return (
        <Fieldset legendTitle="Report Extras">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <ColumnsContainer numberOfCols={3}>
                    <div className="form-group">
                        <Label>Contact Person</Label>
                        <Input
                            placeholder="e.g John Doe"
                            {...register("contact_person")}
                        />
                        {errors.contact_person && (
                            <p className="text-destructive text-sm">
                                {errors.contact_person.message}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <Label>Contact Person Mobile</Label>
                        <Input
                            placeholder="e.g +263 71 000 0000"
                            {...register("contact_person_mobile")}
                        />
                        {errors.contact_person_mobile && (
                            <p className="text-destructive text-sm">
                                {errors.contact_person_mobile.message}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <Label>Name of requestor</Label>
                        <Input
                            placeholder="e.g John Doers"
                            {...register("username")}
                        />
                    </div>

                    <div className="form-group">
                        <Label>Requestor Mobile</Label>
                        <Input
                            placeholder="e.g +234 801 234 5678"
                            {...register("username_mobile")}
                        />
                    </div>

                    <div className="form-group">
                        <Label>Report Reason</Label>
                        <Controller
                            key={getValues("report_reason")}
                            control={control}
                            name="report_reason"
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            REPORT_REASONS_OPTIONS.map((reason:string, index:number) => (
                                                <SelectItem value={reason} key={index}>{toCap(reason)}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.report_reason && (
                            <p className="text-destructive text-sm">
                                {errors.report_reason.message}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <Label>Currency</Label>
                        <Controller
                            key ={getValues("currency")}
                            control={control}
                            name = "currency"
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Please select ..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            CURRENCY_OPTIONS.map((item:string, index:number) => (
                                                <SelectItem value={item} key={index}>{toCap(item)}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.currency && ( <p className="text-destructive text-sm"> {errors.currency.message} </p>)}
                    </div>

                    <div className="form-group">
                        <Label>Amount</Label>
                        <Input
                            {
                                ...register("amount", numericField)
                            }
                            type={"number"}
                            step={"0.01"}
                        />
                        {errors.amount && ( <p className="text-destructive text-sm"> {errors.amount.message} </p>)}
                    </div>  
                    <div className="form-group">
                        <Label>Period (Months)</Label>
                        <Input {...register("period")}/>
                        {errors.period && ( <p className="text-destructive text-sm"> {errors.period.message} </p>)}
                    </div>
                        
                    <div className="form-group">
                        <Label>Occurrence</Label>
                        <Controller
                            key={getValues("occurrence")}
                            control={control}
                            name = "occurrence"
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Please select ..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            OCCURRENCE_OPTIONS.map((item:string, index:number) => (
                                                <SelectItem value={item} key={index}>{toCap(item)}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.occurrence && ( <p className="text-destructive text-sm"> {errors.occurrence.message} </p>)}
                    </div>

                </ColumnsContainer>

                <div className="form-group">
                    <Label>Report Narration</Label>
                    <Textarea
                        placeholder="Enter where you left off"
                        {...register("report_narration")}
                    />
                </div>

                <CustomSubmitButton
                    onFine={onTouched}
                    state={touched}
                    showFine
                    isPending={isPending}
                />
            </form>
        </Fieldset>
    );
}

export default ReportExtras;
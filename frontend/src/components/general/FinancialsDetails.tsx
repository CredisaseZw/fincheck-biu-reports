import useFinancialsDetails from "@/hooks/useFinancialsDetails"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"
import FileUploadField from "./FileUploadField"
import type { FinancialsProps } from "@/types/core"
import CustomSubmitButton from "./CustomSubmitButton"

function FinancialsDetails({
    report_id,
    subject_object_id,
    subject_type,
    financials_data,
}: FinancialsProps) {
    const {
        touched,
        register,
        handleSubmit,
        onSubmit,
        watch,
        errors,
        numericField,
        isPending,
    } = useFinancialsDetails({
        report_id,
        subject_object_id,
        subject_type,
        financials_data,
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Financials" className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <div className="form-group">
                        <Label>Financial Year</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 2024"
                            {...register("financial_year", numericField)}
                        />
                        {errors.financial_year && (
                            <p className="text-destructive text-sm">
                                {errors.financial_year?.message as string}
                            </p>
                        )}
                    </div>
                    <ColumnsContainer numberOfCols={3} gapClass="gap-4">
                        <div className="form-group">
                            <Label>Revenue</Label>
                            <Input {...register("total_revenue")} />
                            {errors.total_revenue && (
                                <p className="text-destructive text-sm">
                                    {errors.total_revenue?.message as string}
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <Label>Net Profit</Label>
                            <Input {...register("net_profit")} />
                            {errors.net_profit && (
                                <p className="text-destructive text-sm">
                                    {errors.net_profit?.message as string}
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <Label>Total Assets</Label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register("total_assets", numericField)}
                            />
                            {errors.total_assets && (
                                <p className="text-destructive text-sm">
                                    {errors.total_assets?.message as string}
                                </p>
                            )}
                        </div>
                    </ColumnsContainer>

                    <ColumnsContainer gapClass="gap-4">
                        <div className="form-group">
                            <Label>Net Worth</Label>
                            <Input {...register("net_worth")} />
                            {errors.net_worth && (
                                <p className="text-destructive text-sm">
                                    {errors.net_worth?.message as string}
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <Label>Asset Ratio</Label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register("asset_ratio", numericField)}
                            />
                            {errors.asset_ratio && (
                                <p className="text-destructive text-sm">
                                    {errors.asset_ratio?.message as string}
                                </p>
                            )}
                        </div>
                    </ColumnsContainer>

                    <FileUploadField
                        label="Financials File"
                        error={errors.financials_file?.message as string}
                        preview={watch("financials_file")}
                        inputProps={register("financials_file")}
                        default_file={watch("default_file")}
                    />
                </div>

                <div className="flex justify-end">
                    <CustomSubmitButton
                        state={touched}
                        isPending={isPending}
                    />
                </div>
            </Fieldset>
        </form>
    )
}

export default FinancialsDetails
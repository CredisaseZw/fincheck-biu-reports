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

    const _numeric_three_rows = [
        { name: "total_revenue", label: "Revenue" },
        { name: "net_profit", label: "Net Profit" },
        { name: "total_assets", label: "Total Assets" }
    ] as const

    const _numeric_two_rows = [
        { name: "net_worth", label: "Net Worth" },
        { name: "asset_ratio", label: "Asset Ratio" },    
    ]

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Financials" className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    {/* Numeric fields */}
                    <ColumnsContainer numberOfCols={3} gapClass="gap-4">
                        {_numeric_three_rows.map(({ name, label }) => (
                            <div key={name} className="form-group">
                                <Label>{label}</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register(name as any, numericField)}
                                />
                                {errors[name as keyof typeof errors] && (
                                    <p className="text-destructive text-sm">
                                        {errors[name as keyof typeof errors]?.message as string}
                                    </p>
                                )}
                            </div>
                        ))}
                    </ColumnsContainer>
                    <ColumnsContainer gapClass="gap-4">
                        {_numeric_two_rows.map(({ name, label }) => (
                            <div key={name} className="form-group">
                                <Label>{label}</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register(name as any, numericField)}
                                />
                                {errors[name as keyof typeof errors] && (
                                    <p className="text-destructive text-sm">
                                        {errors[name as keyof typeof errors]?.message as string}
                                    </p>
                                )}
                            </div>
                        ))}
                    </ColumnsContainer>

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
                    <FileUploadField
                        label="Financials File"
                        error={errors.financials_file?.message as string}
                        preview={watch("financials_file")}
                        inputProps={register("financials_file")}
                        default_file={watch("default_file")}
                    />
                </div>

                <div className="flex justify-end">
                    <CustomSubmitButton isPending={isPending} />
                </div>
            </Fieldset>
        </form>
    )
}

export default FinancialsDetails
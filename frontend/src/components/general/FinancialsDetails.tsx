import useFinancialsDetails from "@/hooks/useFinancialsDetails"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"
import FileUploadField from "./FileUploadField";

function FinancialsDetails() {
    const { register, handleSubmit, onSubmit, watch, errors, numericField } = useFinancialsDetails()

    const numberFields = [
        { name: "total_assets", label: "Total Assets"},
        { name: "net_profit", label: "Net Profit"},
        { name: "net_worth", label: "Net Worth" },
        { name: "total_revenue", label: "Total Revenue" },
        { name: "paid_up_capital",  label: "Paid Up Capital"},
        { name: "authorized_capital", label: "Authorized Capital" },
    ] as const

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Financials" className="flex flex-col gap-4">

                <ColumnsContainer numberOfCols={3} gapClass="gap-4">
                    {numberFields.map(({ name, label }) => (
                        <div key={name} className="form-group">
                            <Label>{label}</Label>
                            <Input type="number" step="0.01" {...register(name, numericField)} />
                            {errors[name] && <p className="text-destructive text-sm">{errors[name]?.message}</p>}
                        </div>
                    ))}
                </ColumnsContainer>
                <div className="form-group">
                    <Label>Financial Year</Label>
                    <Input type="number" {...register("financial_year", numericField)} placeholder="e.g. 2024" />
                    {errors.financial_year && <p className="text-destructive text-sm">{errors.financial_year.message}</p>}
                </div>
                <ColumnsContainer numberOfCols={2} gapClass="gap-4">
                    <FileUploadField
                        label="Profit & Loss Statement"
                        error={errors.profit_and_loss?.message as string}
                        preview={watch("profit_and_loss")}
                        inputProps={register("profit_and_loss")}
                    />
                    <FileUploadField
                        label="Statement of Financial Position"
                        error={errors.statement_of_financial_position?.message as string}
                        preview={watch("statement_of_financial_position")}
                        inputProps={register("statement_of_financial_position")}
                    />
                </ColumnsContainer>

                <div className="flex justify-end">
                    <Button type="submit">Submit</Button>
                </div>

            </Fieldset>
        </form>
    )
}

export default FinancialsDetails
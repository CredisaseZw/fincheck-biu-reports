import useFinancialsDetails from "@/hooks/useFinancialsDetails"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"
import FileUploadField from "./FileUploadField"
import type { FinancialsProps } from "@/types/core"
import CustomSubmitButton from "./CustomSubmitButton"
import { useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

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
        getValues,
        deleteFile, 
        isDeleting,
        touched,
        errors,
        numericField,
        isPending,
        control,
    } = useFinancialsDetails({
        report_id,
        subject_object_id,
        subject_type,
        financials_data,
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "files"
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

                    <div className="flex flex-col gap-4 mt-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Financial Files</Label>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => append({ file_title: "" })}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" /> Add File
                            </Button>
                        </div>
                        
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-start gap-4 p-4 border rounded-md relative">
                                <div className="flex-1 space-y-4">
                                    <div className="form-group">
                                        <Label>File Title</Label>
                                        <Input 
                                            placeholder="e.g. Audit Report 2024" 
                                            {...register(`files.${index}.file_title` as const)} 
                                        />
                                        {errors?.files?.[index]?.file_title && (
                                            <p className="text-destructive text-sm">
                                                {errors.files[index]?.file_title?.message as string}
                                            </p>
                                        )}
                                    </div>
                                    <FileUploadField
                                        label="File"
                                        error={errors?.files?.[index]?.file?.message as string}
                                        preview={watch(`files.${index}.file` as const)}
                                        inputProps={register(`files.${index}.file` as const)}
                                        default_file={watch(`files.${index}.default_file` as const)}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled = {isDeleting}
                                    onClick={() => {
                                        const id = getValues(`files.${index}.id`)
                                        remove(index)
                                        if(id){
                                            deleteFile(id)
                                        }
                                    }}
                                    className="text-destructive mt-8"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        ))}
                    </div>
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
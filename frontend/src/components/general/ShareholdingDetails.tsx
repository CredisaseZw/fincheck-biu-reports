import useShareholdingDetails from "@/hooks/useShareholdingDetails"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"
import { numericField } from "@/constants";
import type { CompanyShareholdingProps } from "@/types/core";
import CustomSubmitButton from "./CustomSubmitButton";

function ShareholdingDetails({
    subject_object_id,
    subject_type,
    report_id,
    shareholdings_data
}:CompanyShareholdingProps) {
    const { 
        isPending,
        errors,
        fields, 
        register, 
        handleSubmit, 
        onSubmit,
        append, 
        remove, 
        onDelete,
        getValues,
        } = useShareholdingDetails({
            subject_object_id,
            subject_type,
            report_id,
            shareholdings_data
        })

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Shareholding Details" className="flex flex-col gap-4">

                <ColumnsContainer numberOfCols={2} gapClass="gap-4">
                    <div className="form-group">
                        <Label className="required">Number of Shares</Label>
                        <Input type="number" {...register("numbers_of_shares", numericField)} />
                        {errors.numbers_of_shares && (
                            <p className="text-destructive text-sm">{errors.numbers_of_shares.message}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <Label className="required">Number of Shareholders</Label>
                        <Input type="number" {...register("numbers_of_shareholders", numericField)} />
                        {errors.numbers_of_shareholders && (
                            <p className="text-destructive text-sm">{errors.numbers_of_shareholders.message}</p>
                        )}
                    </div>
                </ColumnsContainer>

                {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col gap-3 border rounded-md p-4">

                        <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-muted-foreground">
                                Shareholder {index + 1}
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    const id = getValues(`shareholders.${index}.id`)
                                    remove(index)
                                    if(id){
                                        onDelete(id)
                                    }
                                }}
                            >
                                <Trash2 size={16} className="text-destructive" />
                            </Button>
                        
                        </div>

                        <ColumnsContainer numberOfCols={2} gapClass="gap-4">
                            <div className="form-group">
                                <Label className="required">Full Name</Label>
                                <Input {...register(`shareholders.${index}.full_name`)} />
                                {errors.shareholders?.[index]?.full_name && (
                                    <p className="text-destructive text-sm">{errors.shareholders[index].full_name.message}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <Label className="required">Address</Label>
                                <Input {...register(`shareholders.${index}.address`)} />
                                {errors.shareholders?.[index]?.address && (
                                    <p className="text-destructive text-sm">{errors.shareholders[index].address.message}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <Label className="required">Number of Shares</Label>
                                <Input
                                    type="number"
                                    {...register(`shareholders.${index}.number_of_shares`, numericField)}
                                />
                                {errors.shareholders?.[index]?.number_of_shares && (
                                    <p className="text-destructive text-sm">{errors.shareholders[index].number_of_shares.message}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <Label className="required">Percentage Ownership</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register(`shareholders.${index}.percentage_ownership`, numericField)}
                                />
                                {errors.shareholders?.[index]?.percentage_ownership && (
                                    <p className="text-destructive text-sm">{errors.shareholders[index].percentage_ownership.message}</p>
                                )}
                            </div>
                        </ColumnsContainer>
                    </div>
                ))}

                <div className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        className="self-start"
                        onClick={() => append({
                            full_name: "",
                            address: "",
                            number_of_shares: 0,
                            percentage_ownership: 0,
                        })}
                    >
                        <Plus size={16} className="mr-2" /> Add Shareholder
                    </Button>
                    <CustomSubmitButton isPending ={isPending}/>
                </div>

            </Fieldset>
        </form>
    )
}

export default ShareholdingDetails
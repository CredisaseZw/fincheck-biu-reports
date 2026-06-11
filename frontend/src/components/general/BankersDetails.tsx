import useBankersDetails, { type BankerDetailsFormData } from "@/hooks/useBankersDetails"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"

function BankerDetails() {
    const { register, control, handleSubmit, errors, fields, append, remove } = useBankersDetails()

    const onSubmit = (data: BankerDetailsFormData) => console.log(data)

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Banker Details" className="flex flex-col gap-4">

                {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col gap-4 border rounded-md p-4">

                        <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-muted-foreground">
                                Account {index + 1}
                            </p>
                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 size={16} className="text-destructive" />
                                </Button>
                            )}
                        </div>

                        <ColumnsContainer numberOfCols={3} gapClass="gap-4">
                            <div className="form-group">
                                <Label className="required">Bank</Label>
                                <Input {...register(`accounts.${index}.bank`)} />
                                {errors.accounts?.[index]?.bank && (
                                    <p className="text-destructive text-sm">{errors.accounts[index].bank.message}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <Label className="required">Branch</Label>
                                <Input {...register(`accounts.${index}.branch`)} />
                                {errors.accounts?.[index]?.branch && (
                                    <p className="text-destructive text-sm">{errors.accounts[index].branch.message}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <Label>Account Name</Label>
                                <Input {...register(`accounts.${index}.account_name`)} />
                            </div>

                        </ColumnsContainer>
                        <ColumnsContainer>
                            <div className="form-group">
                                <Label className="required">Account Number</Label>
                                <Input {...register(`accounts.${index}.account_number`)} />
                                {errors.accounts?.[index]?.account_number && (
                                    <p className="text-destructive text-sm">{errors.accounts[index].account_number.message}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <Label className="required">Account Type</Label>
                                <Controller
                                    control={control}
                                    name={`accounts.${index}.account_type`}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="current">Current</SelectItem>
                                                <SelectItem value="savings">Savings</SelectItem>
                                                <SelectItem value="loan">Loan</SelectItem>
                                                <SelectItem value="fixed_deposit">Fixed Deposit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.accounts?.[index]?.account_type && (
                                    <p className="text-destructive text-sm">{errors.accounts[index].account_type.message}</p>
                                )}
                            </div>
                        </ColumnsContainer>
                    </div>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    className="self-start"
                    onClick={() => append({
                        bank: "",
                        branch: "",
                        account_name: "",
                        account_type: "current",
                        account_number: "",
                    })}
                >
                    <Plus /> Add Account
                </Button>

                <div className="flex justify-end">
                    <Button type="submit">Submit</Button>
                </div>

            </Fieldset>
        </form>
    )
}

export default BankerDetails
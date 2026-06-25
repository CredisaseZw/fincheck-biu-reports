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
import CustomSubmitButton from "./CustomSubmitButton";
import { ACCOUNT_TYPES, CURRENCY_OPTIONS, NARRATIONS } from "@/constants";

function BankerDetails() {
    const { 
        append,
        remove, 
        getValues,
        register, 
        handleSubmit,
        errors, 
        fields, 
        control,
    } = useBankersDetails()

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

                        <ColumnsContainer numberOfCols={2} gapClass="gap-4">
                            <div className="form-group">
                                <Label className="required">Bank</Label>
                                <Input {...register(`accounts.${index}.bank`)} />
                                {errors.accounts?.[index]?.bank && (
                                    <p className="text-destructive text-sm">{errors.accounts[index].bank.message}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <Label>Branch</Label>
                                <Input {...register(`accounts.${index}.branch`)} />
                                {errors.accounts?.[index]?.branch && (
                                    <p className="text-destructive text-sm">{errors.accounts[index].branch.message}</p>
                                )}
                            </div>
                        </ColumnsContainer>
                        <div className="form-group">
                            <Label className="required">Account Name</Label>
                            <Input {...register(`accounts.${index}.account_name`)} />
                            {errors.accounts?.[index]?.account_name && (
                                <p className="text-destructive text-sm">{errors.accounts[index].account_name.message}</p>
                            )}
                        </div>

                        <ColumnsContainer gapClass="gap-4">
                            <div className="form-group">
                                <Label className="required">Account Number</Label>
                                <div className="flex flex-row gap-3">
                                    <Controller
                                        control={control}
                                        key={getValues(`accounts.${index}.account_currency`)}
                                        name={`accounts.${index}.account_currency`}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select currency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CURRENCY_OPTIONS.map((c) => (
                                                        <SelectItem key={c} value={c}>
                                                            {c}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <Input {...register(`accounts.${index}.account_number`)} />   
                                </div>
                                {errors.accounts?.[index]?.account_number && (
                                    <p className="text-destructive text-sm">{errors.accounts[index].account_number.message}</p>
                                )}
                                {errors.accounts?.[index]?.account_currency && (
                                    <p className="text-destructive text-sm">{errors.accounts[index].account_currency.message}</p>
                                )}
                            </div>
                            <div className="form-group">
                                <Label className="required">Bank Code</Label>
                                <Input {...register(`accounts.${index}.bank_code`)} />
                                {errors.accounts?.[index]?.bank_code && (
                                    <p className="text-destructive text-sm">{errors.accounts[index].bank_code.message}</p>
                                )}
                            </div>
                        </ColumnsContainer>

                        <ColumnsContainer numberOfCols={3} gapClass="gap-4">
                            <div className="form-group">
                                <Label className="required">Date of Acquirement</Label>
                                <Input
                                    type="date"
                                    {...register(`accounts.${index}.date_of_acquirement`)}
                                />
                                {errors.accounts?.[index]?.date_of_acquirement && (
                                    <p className="text-destructive text-sm">{errors.accounts[index].date_of_acquirement.message}</p>
                                )}
                            </div>
                            <div className="form-group">
                                <Label className="required">Account Type</Label>
                                <Controller
                                    key={getValues(`accounts.${index}.account_type`)}
                                    control={control}
                                    name={`accounts.${index}.account_type`}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ACCOUNT_TYPES.map((t) => (
                                                    <SelectItem key={t.value} value={t.value}>
                                                        {t.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.accounts?.[index]?.account_type && (
                                    <p className="text-destructive text-sm">{errors.accounts[index].account_type.message}</p>
                                )}
                            </div>
                            <div className="form-group">
                                <Label className="required">Narration</Label>
                                <Controller
                                    key={getValues(`accounts.${index}.narration`)}
                                    control={control}
                                    name={`accounts.${index}.narration`}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select narration" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {NARRATIONS.map((n) => (
                                                    <SelectItem key={n.value} value={n.value}>
                                                        {n.value} – {n.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.accounts?.[index]?.narration && (
                                    <p className="text-destructive text-sm">{errors.accounts[index].narration.message}</p>
                                )}
                            </div>
                        </ColumnsContainer>

                    </div>
                ))}
                <div className="w-full flex flex-row justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        className="self-start"
                        onClick={() => append({
                            bank: "",
                            branch: "",
                            account_name: "",
                            account_type: "current",
                            account_currency: "ZiG",
                            account_number: "",
                            date_of_acquirement: "",
                            bank_code: "",
                            narration: "C",
                        })}
                    >
                        <Plus /> Add Account
                    </Button>
                    <CustomSubmitButton/>
                </div>
            </Fieldset>
        </form>
    )
}

export default BankerDetails
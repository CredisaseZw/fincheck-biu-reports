import { CLEAR_MESSAGE, CURRENCY_OPTIONS, numericField } from "@/constants";
import Fieldset from "./FieldSet";
import useClaims from "@/hooks/useClaims";
import { Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Trash2, Plus } from "lucide-react";
import type { ClaimsProps } from "@/types/core";
import CustomSubmitButton from "./CustomSubmitButton";
import ColumnsContainer from "./ColumnsContainer";

function ClaimsDetails({
    claims_data,
    subject_object_id,
    subject_type,
    report_id
}:ClaimsProps) {
    const {
        touched,
        getValues,
        append, 
        remove, 
        onSubmit,
        handleSubmit, 
        register,
        onDelete,
        onTouched,
        control,
        isPending, 
        errors, 
        fields, 
    } = useClaims({
        claims_data,
        subject_object_id,
        subject_type,
        report_id
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Claim Records" className="flex flex-col gap-4 " >
                {
                    fields.length <= 0 &&
                    <div className="text-center text-muted-foreground">{CLEAR_MESSAGE}</div>
                }
                {
                    fields.length > 0 &&
                    fields.map((f, idx) => {
                    return (
                        <div key={f.id} className="rounded-lg border p-4 space-y-3">
                            <div className="form-group">
                                <label className="text-sm font-medium mb-1 inline-block">Creditor Name</label>
                                <Input
                                    placeholder="Creditor Name"
                                    {...register(`claims.${idx}.creditor_name`)} />
                                {errors.claims?.[idx]?.creditor_name && (
                                    <p className="text-destructive text-sm">{errors.claims[idx].creditor_name.message}</p>
                                )}
                            </div>
                            <ColumnsContainer numberOfCols={3}>
                                <div className="form-group">
                                    <label className="text-sm font-medium mb-1 inline-block">Currency</label>
                                    <Controller
                                        control={control}
                                        name={`claims.${idx}.currency`}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Currency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CURRENCY_OPTIONS.map(currency => (
                                                        <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="text-sm font-medium mb-1 inline-block">Amount</label>
                                    <Input
                                        placeholder="Amount"
                                        type="number"
                                        step="0.01"
                                        {...register(`claims.${idx}.amount`, numericField)}
                                    />
                                    {errors.claims?.[idx]?.amount && (
                                        <p className="text-destructive text-sm">{errors.claims[idx].amount.message}</p>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="text-sm font-medium mb-1 inline-block">Overdue Balance</label>
                                    <Input
                                        placeholder="Overdue Balance"
                                        type="number"
                                        step="0.01"
                                        {...register(`claims.${idx}.overdue_balance`, numericField)}
                                    />
                                    {errors.claims?.[idx]?.overdue_balance && (
                                        <p className="text-destructive text-sm">{errors.claims[idx].overdue_balance.message}</p>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="text-sm font-medium mb-1 inline-block">Account Number</label>
                                    <Input
                                        placeholder="Account Number"
                                        {...register(`claims.${idx}.account_number`)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="text-sm font-medium mb-1 inline-block">Claim Date</label>
                                    <Input
                                        type="date"
                                        {...register(`claims.${idx}.claim_date`)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="text-sm font-medium mb-1 inline-block">Status</label>
                                    <Controller
                                        control={control}
                                        name={`claims.${idx}.status`}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="open">Open</SelectItem>
                                                    <SelectItem value="settled">Settled</SelectItem>
                                                    <SelectItem value="disputed">Disputed</SelectItem>
                                                    <SelectItem value="written_off">Written Off</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </ColumnsContainer>
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        const id = getValues(`claims.${idx}.id`)
                                        remove(idx)
                                        if(id){
                                            onDelete(id)
                                        } 
                                    }}
                                >
                                    <Trash2 size={16} className="text-destructive" />
                                </Button>
                            </div>
                        </div>
                    )
                })}

                <div className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({
                            creditor_name: "",
                            currency: "USD",
                            amount: 0,
                            claim_date: undefined,
                            status: "open",
                            debtor_object_id: Number(subject_object_id),
                            debtor_type: subject_type ?? "company",
                        })}
                    >
                        <Plus size={16} className="mr-2" /> Add Row
                    </Button>
                    <CustomSubmitButton
                        showFine
                        onFine={onTouched}
                        state={touched}
                        isPending={isPending}
                    />
                </div>

            </Fieldset>
        </form>
    )
}

export default ClaimsDetails
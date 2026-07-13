import { CLAIMS_HEADERS, CURRENCY_OPTIONS, numericField } from "@/constants";
import BaseTable from "./BaseTable";
import Fieldset from "./FieldSet";
import useClaims from "@/hooks/useClaims";
import { TableCell, TableRow } from "../ui/table";
import { Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import RecordDebtorSelector from "./RecordDebtorSelector";
import SearchEntity, { type SearchEntityRef } from "./SearchEntity";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Trash2, Plus } from "lucide-react";
import type { ClaimsProps } from "@/types/core";
import CustomSubmitButton from "./CustomSubmitButton";

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
        setValue, 
        onSubmit,
        watch, 
        handleSubmit, 
        register,
        onDelete,
        control,
        isPending, 
        errors, 
        fields, 
        refs,
    } = useClaims({
        claims_data,
        subject_object_id,
        subject_type,
        report_id
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Claim Records" className="flex flex-col gap-4 " >
                <BaseTable 
                    isEmpty = {fields.length === 0}
                    headers={CLAIMS_HEADERS}
                >
                    {fields.map((f, idx) => {
                        const setRef = (el: SearchEntityRef | null) => { refs.current[idx] = el }
                        const entityType = watch(`claims.${idx}.debtor_type`)
                        const ds = watch(`claims.${idx}.debtor_default`)

                        return (
                            <TableRow key={f.id} className="relative">
                                <TableCell className="relative">
                                    <div className="flex flex-row gap-1">
                                        <Controller
                                            control={control}
                                            name={`claims.${idx}.debtor_type`}
                                            render={({ field }) => (
                                                <RecordDebtorSelector
                                                    onChange={(val: string) => {
                                                        field.onChange(val)
                                                        refs.current[idx]?.clear()
                                                    }}
                                                    defaultValue={field.value}
                                                />
                                            )}
                                        />
                                        <SearchEntity
                                            ref={setRef}
                                            entityType={entityType}
                                            defaultSearch={ds}
                                            onSelectItem={(id: number) => setValue(`claims.${idx}.debtor_object_id`, id)}
                                        />
                                    </div>
                                    {errors.claims?.[idx]?.debtor_object_id && (
                                        <p className="text-destructive text-sm">{errors.claims[idx].debtor_object_id.message}</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Input
                                    variant="sm"  
                                    {...register(`claims.${idx}.creditor_name`)} />
                                    {errors.claims?.[idx]?.creditor_name && (
                                        <p className="text-destructive text-sm">{errors.claims[idx].creditor_name.message}</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Controller
                                        control={control}
                                        name={`claims.${idx}.currency`}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger className="w-full" size="sm">
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
                                </TableCell>

                                <TableCell>
                                    <Input
                                        variant="sm"    
                                        type="number"
                                        step="0.01"
                                        {...register(`claims.${idx}.amount`, numericField)}
                                    />
                                    {errors.claims?.[idx]?.amount && (
                                        <p className="text-destructive text-sm">{errors.claims[idx].amount.message}</p>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <Input
                                    variant="sm"    
                                        type="date"
                                        {...register(`claims.${idx}.claim_date`)}
                                    />
                                </TableCell>

                                <TableCell>
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
                                </TableCell>

                                <TableCell>
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
                                </TableCell>

                            </TableRow>
                        )
                    })}
                </BaseTable>

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
                            debtor_object_id: 0,
                            debtor_type: "company",
                        })}
                    >
                        <Plus size={16} className="mr-2" /> Add Row
                    </Button>
                    <CustomSubmitButton
                        state={touched}
                        isPending={isPending}
                    />
                </div>

            </Fieldset>
        </form>
    )
}

export default ClaimsDetails
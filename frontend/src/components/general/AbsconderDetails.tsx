import { ABSCONDERS_HEADERS, CURRENCY_OPTIONS, numericField } from "@/constants";
import BaseTable from "./BaseTable";
import Fieldset from "./FieldSet";
import useAbsconderDetails from "@/hooks/useAbsconderDetails";
import { TableCell, TableRow } from "../ui/table";
import { Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import RecordDebtorSelector from "./RecordDebtorSelector";
import SearchEntity, { type SearchEntityRef } from "./SearchEntity";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Trash2, Plus } from "lucide-react";
import type { AbsconderProps } from "@/types/core";
import CustomSubmitButton from "./CustomSubmitButton";

function AbsconderDetails({
  absconders_data,
  subject_object_id,
  subject_type,
  report_id
}:AbsconderProps) {
    const {
        append, 
        remove, 
        setValue, 
        onSubmit,
        watch, 
        onDelete,
        handleSubmit, 
        register,
        getValues,
        isPending,
        control, 
        errors, 
        fields, 
        refs,
        touched,
    } = useAbsconderDetails({
        absconders_data,
        subject_object_id,
        subject_type,
        report_id
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Absconder Records" className="flex flex-col gap-4" >
                <BaseTable 
                    isEmpty = {fields.length === 0}
                    headers={ABSCONDERS_HEADERS}
                >
                    {fields.map((field, idx) => {
                        const setRef = (el: SearchEntityRef | null) => { refs.current[idx] = el }
                        const entityType = watch(`absconders.${idx}.debtor_type`)
                        const ds = watch(`absconders.${idx}.default_search`)

                        return (
                            <TableRow key={field.id}>
                                <TableCell>
                                    <div className="flex flex-row gap-1">
                                        <Controller
                                            control={control}
                                            name={`absconders.${idx}.debtor_type`}
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
                                            onSelectItem={(id: number) => setValue(`absconders.${idx}.debtor_object_id`, id)}
                                        />
                                    </div>
                                    {errors.absconders?.[idx]?.debtor_object_id && (
                                        <p className="text-destructive text-sm">{errors.absconders[idx].debtor_object_id.message}</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Input
                                    variant="sm"  
                                    {...register(`absconders.${idx}.creditor_name`)} />
                                    {errors.absconders?.[idx]?.creditor_name && (
                                        <p className="text-destructive text-sm">{errors.absconders[idx].creditor_name.message}</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Controller
                                        control={control}
                                        name={`absconders.${idx}.currency`}
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
                                        {...register(`absconders.${idx}.amount`, numericField)}
                                    />
                                    {errors.absconders?.[idx]?.amount && (
                                        <p className="text-destructive text-sm">{errors.absconders[idx].amount.message}</p>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <Input
                                    variant="sm"    
                                        type="date"
                                        {...register(`absconders.${idx}.start_date`)}
                                    />
                                </TableCell>

                                <TableCell>
                                    <Controller
                                        control={control}
                                        name={`absconders.${idx}.status`}
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
                                        onClick={() =>{
                                            const id = getValues(`absconders.${idx}.id`)
                                            remove(idx)
                                            if(typeof id  === "number"){
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
                            start_date: undefined,
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

export default AbsconderDetails
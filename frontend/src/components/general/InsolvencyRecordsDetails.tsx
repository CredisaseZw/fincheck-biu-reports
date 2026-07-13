import useInsolvencyRecordsDetails from "@/hooks/useInsolvencyRecordsDetails";
import Fieldset from "./FieldSet";
import BaseTable from "./BaseTable";
import { INSOLVENCY_HEADERS } from "@/constants";
import { TableCell, TableRow } from "../ui/table";
import { Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Trash2, Plus } from "lucide-react";
import type { InsolvencyRecordsProps } from "@/types/core";
import CustomSubmitButton from "./CustomSubmitButton";

function InsolvencyRecordsDetails({
    report_id,
    subject_object_id,
    subject_type,
    insolvency_data
}: InsolvencyRecordsProps) {
    const {
        touched,
        register,
        append,
        remove,
        getValues,
        handleSubmit,
        onSubmit,
        onDelete,
        errors,
        isPending,
        control,
        fields,
    } = useInsolvencyRecordsDetails({
        report_id,
        subject_object_id,
        subject_type,
        insolvency_data
    })
    return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <Fieldset legendTitle="Solvency Details">
            <BaseTable 
                isEmpty = {fields.length === 0}
                headers={INSOLVENCY_HEADERS}>
                    {
                        fields.map((field, idx)=>(
                        <TableRow key= {field.id}>
                                <TableCell>
                                    <Controller
                                        control={control}
                                        name={`insolvency_records.${idx}.insolvency_type`}
                                        render={({ field }) =>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger size="sm">
                                                    <SelectValue placeholder="Please Select..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="insolvent">Insolvent</SelectItem>
                                                    <SelectItem value="judicial_management">Judicial Management</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        }
                                    />
                                    {errors.insolvency_records?.[idx]?.insolvency_type && (
                                        <p className="text-destructive text-sm">
                                            {errors.insolvency_records?.[idx]?.insolvency_type?.message}
                                        </p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        variant="sm"    
                                        type="date"
                                        {...register(`insolvency_records.${idx}.start_date`)}
                                    />
                                    {errors.insolvency_records?.[idx]?.start_date && (
                                        <p className="text-destructive text-sm">{errors.insolvency_records[idx].start_date.message}</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        variant="sm"    
                                        type="date"
                                        {...register(`insolvency_records.${idx}.end_date`)}
                                    />
                                    {errors.insolvency_records?.[idx]?.end_date && (
                                        <p className="text-destructive text-sm">{errors.insolvency_records[idx].end_date.message}</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        variant="sm"    
                                        {...register(`insolvency_records.${idx}.court_reference`)}
                                    />
                                    {errors.insolvency_records?.[idx]?.court_reference && (
                                        <p className="text-destructive text-sm">{errors.insolvency_records[idx].court_reference.message}</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            const id = getValues(`insolvency_records.${idx}.id`)
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
                        ))
                    }
            </BaseTable>
            <div className="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({
                        id: undefined,
                        court_reference: "",
                        insolvency_type: "insolvent",
                        start_date: "",
                        end_date:"",
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

export default InsolvencyRecordsDetails
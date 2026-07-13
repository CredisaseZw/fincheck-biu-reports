import useCourtDetails from "@/hooks/useCourtDetails";
import Fieldset from "./FieldSet";
import { COURT_HEADERS, CURRENCY_OPTIONS, numericField } from "@/constants";
import { TableCell, TableRow } from "../ui/table";
import BaseTable from "./BaseTable";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { CourtJudgementsProps } from "@/types/core";
import { Controller } from "react-hook-form";
import { Select,SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import CustomSubmitButton from "./CustomSubmitButton";

function CourtDetails({
  report_id,
  subject_object_id,
  subject_type,
  court_judgements_data
}:CourtJudgementsProps) {
  const {
    touched,
    fields,
    errors,
    control,
    isPending,
    handleSubmit,
    append,
    getValues,
    onDelete,
    register,
    remove,
    onSubmit
  } = useCourtDetails({
    report_id,
    subject_object_id,
    subject_type,
    court_judgements_data
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Fieldset legendTitle="Court Judgements">
        <BaseTable
          isEmpty = {fields.length === 0}
          headers = {COURT_HEADERS}
        >
            {
              fields.map((f, idx)=>(
              <TableRow key={f.id}>
                <TableCell>
                  <Input
                    variant="sm"  
                    {...register(`court_judgements.${idx}.court_name`)} 
                  />
                  {errors.court_judgements?.[idx]?.court_name && (
                      <p className="text-destructive text-sm">{errors.court_judgements[idx].court_name.message}</p>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    variant="sm"  
                    {...register(`court_judgements.${idx}.case_number`)} 
                  />
                  {errors.court_judgements?.[idx]?.case_number && (
                      <p className="text-destructive text-sm">{errors.court_judgements[idx].case_number.message}</p>
                  )}
                </TableCell>
                <TableCell>
                  <Controller
                      control={control}
                      name={`court_judgements.${idx}.currency`}
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
                    {...register(`court_judgements.${idx}.amount`, numericField)} 
                  />
                  {errors.court_judgements?.[idx]?.amount && (
                      <p className="text-destructive text-sm">{errors.court_judgements[idx].amount.message}</p>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    variant="sm"  
                    type="date"
                    {...register(`court_judgements.${idx}.judgement_date`)} 
                  />
                  {errors.court_judgements?.[idx]?.judgement_date && (
                      <p className="text-destructive text-sm">{errors.court_judgements[idx].judgement_date.message}</p>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const id = getValues(`court_judgements.${idx}.id`)
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
                  court_name :"",
                  case_number: "",
                  currency :"USD",
                  amount: 0,
                  judgement_date: "",
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

export default CourtDetails
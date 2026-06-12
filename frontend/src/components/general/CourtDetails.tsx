import useCourtDetails from "@/hooks/useCourtDetails";
import Fieldset from "./FieldSet";
import { COURT_HEADERS, numericField } from "@/constants";
import { TableCell, TableRow } from "../ui/table";
import BaseTable from "./BaseTable";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";

function CourtDetails() {
  const {
    fields,
    errors,
    handleSubmit,
    append,
    register,
    remove,
    onSubmit
  } = useCourtDetails()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Fieldset legendTitle="Court Judgements">
        <BaseTable
          isEmpty = {fields.length === 0}
          headers = {COURT_HEADERS}
        >
            {
              fields.map((_, idx)=>(
              <TableRow key={idx}>
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
                    disabled={fields.length === 1}
                    onClick={() => remove(idx)}
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
                  court_name :"",
                  case_number: "",
                  amount: 0,
                  judgement_date: "",
              })}
          >
              <Plus size={16} className="mr-2" /> Add Row
          </Button>

          <Button type="submit">Submit</Button>
      </div>
      </Fieldset>
    </form>
  )
}

export default CourtDetails
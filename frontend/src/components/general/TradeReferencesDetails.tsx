import Fieldset from './FieldSet';
import { TRADE_REFERENCES_HEADERS } from '@/constants';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableCell, TableRow } from '@/components/ui/table';
import BaseTable from './BaseTable';
import useTradeReferences from '@/hooks/useTradeRefences';
import { Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function TradeReferencesDetails() {
    const {
        append,
        remove,
        onSubmit,
        handleSubmit,
        register,
        fields,
        errors,
        control
    } = useTradeReferences();

    return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Fieldset legendTitle="Trade References">
        <BaseTable
          isEmpty = {fields.length === 0}
          headers = {TRADE_REFERENCES_HEADERS}
        >
            {
              fields.map((_, idx)=>(
              <TableRow key={idx}>
                <TableCell>
                  <Input
                    variant="sm"  
                    {...register(`trade_references.${idx}.name`)} 
                  />
                  {errors.trade_references?.[idx]?.name && (
                      <p className="text-destructive text-sm">{errors.trade_references[idx].name.message}</p>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    variant="sm"  
                    {...register(`trade_references.${idx}.contact_info`)} 
                  />
                </TableCell>
                <TableCell>
                  <Input
                    variant="sm"  
                    {...register(`trade_references.${idx}.reference_source`)} 
                  />
                </TableCell>
                <TableCell>
                  <Input
                    variant="sm"  
                    {...register(`trade_references.${idx}.position`)} 
                  />
                </TableCell>
                <TableCell>
                  <Input
                    variant="sm"
                    {...register(`trade_references.${idx}.credit_limit`)} 
                  />
                </TableCell>
                <TableCell>
                  <Input
                    variant="sm"
                    {...register(`trade_references.${idx}.credit_terms`)} 
                  />
                </TableCell>
                <TableCell>
                    <Controller
                        control={control}
                        name={`trade_references.${idx}.payment_trend`}
                        render={({field})=>(
                            <Select 
                                defaultValue= {field.value}
                                onOpenChange={field.onChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder = "Please select an item..."></SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value = "good">Good</SelectItem>
                                    <SelectItem value = "fair">Fair</SelectItem>
                                    <SelectItem value = "poor">Poor</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    variant="sm"
                    {...register(`trade_references.${idx}.referenced_date`)} 
                  />
                    {errors.trade_references?.[idx]?.referenced_date && (
                      <p className="text-destructive text-sm">{errors.trade_references[idx].referenced_date.message}</p>
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
                    name : "",
                    referenced_date :"",
                    contact_info :""
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

export default TradeReferencesDetails
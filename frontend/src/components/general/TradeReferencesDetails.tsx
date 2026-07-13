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
import type { TradeReferencesProps } from '@/types/core';
import CustomSubmitButton from './CustomSubmitButton';

function TradeReferencesDetails({
  subject_object_id,
  subject_type,
  report_id,
  trade_references_data
}:TradeReferencesProps) {
    const {
        touched,
        append,
        remove,
        onSubmit,
        handleSubmit,
        onDelete,
        register,
        getValues,
        PaymentTrendsOptions,
        fields,
        errors,
        control,
        isPending
    } = useTradeReferences({
        subject_object_id,
        subject_type,
        report_id,
        trade_references_data
    });

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
                    placeholder = "e,g John"  
                    {...register(`trade_references.${idx}.name`)} 
                  />
                  {errors.trade_references?.[idx]?.name && (
                      <p className="text-destructive text-sm">{errors.trade_references[idx].name.message}</p>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    variant="sm"
                    placeholder = "e.g 078..."  
                    {...register(`trade_references.${idx}.contact_info`)} 
                  />
                </TableCell>
                <TableCell>
                  <Input
                    variant="sm"
                    placeholder = "e.g Call"  
                    {...register(`trade_references.${idx}.reference_source`)} 
                  />
                </TableCell>
                <TableCell>
                  <Input
                    variant="sm"
                    placeholder = "e.g Manager"  
                    {...register(`trade_references.${idx}.position`)} 
                  />
                </TableCell>
                <TableCell>
                  <Input
                    variant="sm"
                    placeholder = "Enter credit limit"
                    {...register(`trade_references.${idx}.credit_limit`)} 
                  />
                </TableCell>
                <TableCell>
                  <Input
                    variant="sm"
                    placeholder = "Enter Credit Terms"
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
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder = "Please select an item..."></SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {
                                    PaymentTrendsOptions.map((opt) => (
                                      <SelectItem value = {opt}>{opt.toUpperCase()}</SelectItem>
                                    ))
                                  }
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.trade_references?.[idx]?.payment_trend && (
                      <p className="text-destructive text-sm">{errors.trade_references[idx].payment_trend.message}</p>
                    )}
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    variant="sm"
                    placeholder = "Enter Reference Date"
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
                    onClick={() => {
                      const id = getValues(`trade_references.${idx}.id`)
                      remove(idx)
                      if (id){
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
                    name : "",
                    referenced_date :"",
                    contact_info :""
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

export default TradeReferencesDetails
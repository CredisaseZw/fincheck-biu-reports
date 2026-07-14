import Fieldset from './FieldSet';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
       {fields.map((_, idx) => (
          <div key={idx} className="rounded-lg border p-4 space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div className="form-group">
                <label>Name</label>
                <Input placeholder="e.g John" {...register(`trade_references.${idx}.name`)} />
                {errors.trade_references?.[idx]?.name && (
                  <p className="text-destructive text-sm">{errors.trade_references[idx].name.message}</p>
                )}
              </div>
              <div className="form-group">
                <label>Contact Info</label>
                <Input placeholder="e.g 078..." {...register(`trade_references.${idx}.contact_info`)} />
              </div>
              <div className="form-group">
                <label>Reference Source</label>
                <Input placeholder="e.g Call" {...register(`trade_references.${idx}.reference_source`)} />
              </div>
              <div className="form-group">
                <label>Position</label>
                <Input placeholder="e.g Manager" {...register(`trade_references.${idx}.position`)} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="form-group">
                <label>Credit Limit</label>
                <Input placeholder="Enter credit limit" {...register(`trade_references.${idx}.credit_limit`)} />
              </div>
              <div className="form-group">
                <label>Credit Terms</label>
                <Input placeholder="Enter Credit Terms" {...register(`trade_references.${idx}.credit_terms`)} />
              </div>
              <div className="form-group">
                <label>Payment Trend</label>
                <Controller
                  control={control}
                  name={`trade_references.${idx}.payment_trend`}
                  render={({ field }) => (
                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PaymentTrendsOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.trade_references?.[idx]?.payment_trend && (
                  <p className="text-destructive text-sm">{errors.trade_references[idx].payment_trend.message}</p>
                )}
              </div>
              <div className="form-group">
                <label>Reference Date</label>
                <Input type="date" {...register(`trade_references.${idx}.referenced_date`)} />
                {errors.trade_references?.[idx]?.referenced_date && (
                  <p className="text-destructive text-sm">{errors.trade_references[idx].referenced_date.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const id = getValues(`trade_references.${idx}.id`)
                  remove(idx)
                  if (id) onDelete(id)
                }}
              >
                <Trash2 size={16} className="text-destructive" />
              </Button>
            </div>
          </div>
        ))}
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
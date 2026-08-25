import Fieldset from './FieldSet';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useTradeReferences from '@/hooks/useTradeRefences';
import { Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { TradeReferencesProps } from '@/types/core';
import CustomSubmitButton from './CustomSubmitButton';
import { Label } from '../ui/label';
import { CLEAR_MESSAGE } from '@/constants';

function TradeReferencesDetails({
  subject_object_id,
  subject_type,
  report_id,
  trade_references_data
}:TradeReferencesProps) {
    const {
        append,
        remove,
        onSubmit,
        handleSubmit,
        onDelete,
        register,
        getValues,
        onTouched,
        PaymentTrendsOptions,
        touched,
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
        { 
          fields.length <= 0 &&
          <div className="text-center text-muted-foreground">{CLEAR_MESSAGE}</div>      
        }
       { 
        fields.length >=1 &&
        fields.map((_, idx) => (
          <div key={idx} className="rounded-lg border p-4 space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div className="form-group">
                <Label className="required">Name</Label>
                <Input placeholder="e.g John" {...register(`trade_references.${idx}.name`)} />
                {errors.trade_references?.[idx]?.name && (
                  <p className="text-destructive text-sm">{errors.trade_references[idx].name.message}</p>
                )}
              </div>
              <div className="form-group">
                <Label>Contact Info</Label>
                <Input placeholder="e.g 078..." {...register(`trade_references.${idx}.contact_info`)} />
              </div>
              <div className="form-group">
                <Label>Reference Source</Label>
                <Input placeholder="e.g Call" {...register(`trade_references.${idx}.reference_source`)} />
              </div>
              <div className="form-group">
                <Label>Position</Label>
                <Input placeholder="e.g Manager" {...register(`trade_references.${idx}.position`)} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="form-group">
                <Label>Credit Limit</Label>
                <Input placeholder="Enter credit limit" {...register(`trade_references.${idx}.credit_limit`)} />
              </div>
              <div className="form-group">
                <Label>Credit Terms</Label>
                <Input placeholder="Enter Credit Terms" {...register(`trade_references.${idx}.credit_terms`)} />
              </div>
              <div className="form-group">
                <Label>Payment Trend</Label>
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
                <Label className="required">Reference Date</Label>
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

export default TradeReferencesDetails
import useCompanyOperations from "@/hooks/useCompanyOperations"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"
import type { CompanyOperationsProps } from "@/types/core";
import { Controller } from "react-hook-form";
import CustomSubmitButton from "./CustomSubmitButton";

function CompanyOperations({
    report_id,
    subject_object_id,
    operations_data,
    subject_type
}:CompanyOperationsProps) {
    const {
        touched, 
        register, 
        handleSubmit, 
        onSubmit,
        getValues,
        control,
        isPending,
        errors
    } = useCompanyOperations({
        report_id,
        subject_object_id,
        operations_data,
        subject_type
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Company Operations" className="flex flex-col gap-4">
                <div className="form-group">
                    <Label>Industry</Label>
                    <Input {...register("industry")} placeholder="e.g. Financial Services" />
                </div>
                <ColumnsContainer numberOfCols={2} gapClass="gap-4">
                    <Controller
                        control={control}
                        name="purchases_payment_terms"
                        render={({ field }) => (                            
                            <div className="form-group">
                                <Label className="required">Purchases Payment Terms</Label>
                                <Select 
                                    key = {getValues("purchases_payment_terms")}
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select payment terms" {...field} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash_only">Cash Only</SelectItem>
                                        <SelectItem value="cash_and_credit">Cash and Credit</SelectItem>
                                        <SelectItem value="credit_only">Credit Only</SelectItem>
                                    </SelectContent>
                                </Select>
                                {
                                    errors.purchases_payment_terms && (
                                    <p className="text-destructive text-sm">{errors.purchases_payment_terms.message}</p>
                                )}  
                                                                    
                            </div>
                        )}
                    />
                    <Controller
                        control={control}
                        name="purchase_supplier_scope"
                        render={({ field }) => (                            
                            <div className="form-group">
                                <Label className="required">Purchases Supplier Scope</Label>
                                <Select 
                                    key = {getValues("purchase_supplier_scope")}
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select payment terms" {...field} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="local">Local</SelectItem>
                                        <SelectItem value="local_&_international">Local & International</SelectItem>
                                        <SelectItem value="international">International</SelectItem>
                                    </SelectContent>
                                </Select>
                                {
                                    errors.purchase_supplier_scope && (
                                    <p className="text-destructive text-sm">{errors.purchase_supplier_scope.message}</p>
                                )
                                }
                            </div>
                        )}
                    />
                </ColumnsContainer>
                <Controller
                    control={control}
                    name="sales_payment_terms"
                    render={({ field }) => (                            
                        <div className="form-group">
                            <Label className="required">Sales Payment Terms</Label>
                            <Select 
                                key = {getValues("sales_payment_terms")}
                                defaultValue={field.value}
                                onValueChange={field.onChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select payment terms" {...field} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash_only">Cash Only</SelectItem>
                                    <SelectItem value="cash_and_credit">Cash and Credit</SelectItem>
                                    <SelectItem value="credit_only">Credit Only</SelectItem>
                                </SelectContent>
                            </Select>
                            {
                                errors.sales_payment_terms && (
                                <p className="text-destructive text-sm">{errors.sales_payment_terms.message}</p>
                            )
                            }
                        </div>
                    )}
                />
                <ColumnsContainer numberOfCols={2} gapClass="gap-4">
                    <div className="form-group">
                        <Label>Target Markets</Label>
                        <Textarea {...register("target_markets")} rows={3} placeholder="Describe target markets" />
                        {
                            errors.target_markets && (
                            <p className="text-destructive text-sm">{errors.target_markets.message}</p>
                        )
                        }
                    </div>

                    <div className="form-group">
                        <Label>Operations Territories</Label>
                        <Textarea {...register("operations_territories")} rows={3} placeholder="List territories" />
                        {
                            errors.operations_territories && (
                            <p className="text-destructive text-sm">{errors.operations_territories.message}</p>     
                        ) 
                     }
                    </div>

                    <div className="form-group">
                        <Label>Property Ownership</Label>
                        <Textarea {...register("property_ownership")} rows={3} placeholder="Describe property ownership" />
                        {
                            errors.property_ownership && (
                            <p className="text-destructive text-sm">{errors.property_ownership.message}</p>
                        )
                        }
                    </div>

                    <div className="form-group">
                        <Label>Operational Areas</Label>
                        <Textarea {...register("operational_areas")} rows={3} placeholder="List operational areas" />
                        {
                            errors.operational_areas && (  
                            <p className="text-destructive text-sm">{errors.operational_areas.message}</p>
                        )
                        }
                    </div>
                </ColumnsContainer>
                <div className="form-group">
                    <Label>Import / Export</Label>
                    <Textarea {...register("import_export")} rows={3} placeholder="Describe import/export activities" />
                    {
                        errors.import_export && (
                        <p className="text-destructive text-sm">{errors.import_export.message}</p>
                    )
                    }
                </div>
                   
                <CustomSubmitButton
                        state={touched}
                        isPending={isPending}
                    />
            </Fieldset>
        </form>
    )
}

export default CompanyOperations
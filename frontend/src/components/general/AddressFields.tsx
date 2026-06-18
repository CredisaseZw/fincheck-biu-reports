import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Fieldset from "./FieldSet"
import ColumnsContainer from "./ColumnsContainer"
import { Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { COUNTRIES } from "@/constants";

interface AddressFieldsetProps {
    register: any
    errors: any
    control: any
    showRequired : boolean
    primaryPrefix: string
    secondaryPrefix?: string
    secondaryLabel?: string
    showSecondary?: boolean
    initialOpen?: boolean
}

function AddressFields({
    prefix,
    control,
    register,
    errors,
    showRequired
}: {
    showRequired : boolean
    control: any
    prefix: string
    register: any
    errors: any
}) {
    const e = errors[prefix]

    return (
        <div className="flex flex-col gap-3">
            <div className="form-group">
                <Label className={showRequired ? "required" : "not-required"}>Street Address</Label>
                <Input {...register(`${prefix}.street_address`)} placeholder="123 Main St" />
                {e?.street_address && <p className="text-destructive text-sm">{e.street_address.message}</p>}
            </div>

            <div className="form-group">
                <Label>Line 2</Label>
                <Input {...register(`${prefix}.line_2`)} placeholder="Apartment, suite, etc." />
            </div>

            <ColumnsContainer numberOfCols={3} gapClass="gap-4">
                <div className="form-group">
                    <Label className={showRequired ? "required" : "not-required"}>Country</Label>
                    <Controller
                        name = {`${prefix}.country`}
                        control={control}
                        render={({field})=>(
                          <Select
                            defaultValue= {field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder = "Please Select item"/>
                            </SelectTrigger>
                            <SelectContent>
                                {COUNTRIES.map((item, idx)=>(
                                    <SelectItem value={item} key={idx}>{item}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>  
                        )}
                    />
                    {e?.country && <p className="text-destructive text-sm">{e.country.message}</p>}
                </div>

                <div className="form-group">
                    <Label className={showRequired ? "required" : "not-required"}>Province</Label>
                    <Input {...register(`${prefix}.province`)} />
                    {e?.province && <p className="text-destructive text-sm">{e.province.message}</p>}
                </div>

                <div className="form-group">
                    <Label className={showRequired ? "required" : "not-required"}>City</Label>
                    <Input {...register(`${prefix}.city`)} />
                    {e?.city && <p className="text-destructive text-sm">{e.city.message}</p>}
                </div>
            </ColumnsContainer>            
            <div className="form-group">
                <Label>Postal Code</Label>
                <Input {...register(`${prefix}.postal_code`)} />
            </div>
        </div>
    )
}

function AddressFieldset({
    register,
    errors,
    primaryPrefix,
    secondaryPrefix,
    control,
    showRequired = true,
    secondaryLabel = "Add Secondary Address",
    showSecondary = true,
    initialOpen = false,
}: AddressFieldsetProps) {
    const [open, setOpen] = useState(initialOpen)

    return (
        <Fieldset legendTitle="Address">
            <AddressFields
             showRequired = {showRequired}
             prefix={primaryPrefix} 
             register={register} 
             errors={errors} 
             control={control}
             />

            {showSecondary && secondaryPrefix && (
                <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
                    <CollapsibleTrigger className="items-center gap-2 text-md w-full flex flex-row justify-between font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        {open ? "Hide" : secondaryLabel}
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        />
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-4">
                        {open && (
                            <AddressFields
                                showRequired = {false}
                                control={control} 
                                prefix={secondaryPrefix} 
                                register={register} 
                                errors={errors} 
                            />
                        )}
                    </CollapsibleContent>
                </Collapsible>
            )}
        </Fieldset>
    )
}

export default AddressFieldset
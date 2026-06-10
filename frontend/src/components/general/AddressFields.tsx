import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Fieldset from "./FieldSet"
import ColumnsContainer from "./ColumnsContainer"

interface AddressFieldsetProps {
    register: any
    errors: any
    primaryPrefix: string
    secondaryPrefix?: string
    secondaryLabel?: string
    showSecondary?: boolean
    initialOpen?: boolean
}

function AddressFields({
    prefix,
    register,
    errors,
}: {
    prefix: string
    register: any
    errors: any
}) {
    const e = errors[prefix]

    return (
        <div className="flex flex-col gap-3">
            <div className="form-group">
                <Label className="required">Street Address</Label>
                <Input {...register(`${prefix}.street_address`)} placeholder="123 Main St" />
                {e?.street_address && <p className="text-destructive text-sm">{e.street_address.message}</p>}
            </div>

            <div className="form-group">
                <Label>Line 2</Label>
                <Input {...register(`${prefix}.line_2`)} placeholder="Apartment, suite, etc." />
            </div>

            <ColumnsContainer numberOfCols={3} gapClass="gap-4">
                <div className="form-group">
                    <Label className="required">Country</Label>
                    <Input {...register(`${prefix}.country`)} />
                    {e?.country && <p className="text-destructive text-sm">{e.country.message}</p>}
                </div>

                <div className="form-group">
                    <Label className="required">Province</Label>
                    <Input {...register(`${prefix}.province`)} />
                    {e?.province && <p className="text-destructive text-sm">{e.province.message}</p>}
                </div>

                <div className="form-group">
                    <Label className="required">City</Label>
                    <Input {...register(`${prefix}.city`)} />
                    {e?.city && <p className="text-destructive text-sm">{e.city.message}</p>}
                </div>
            </ColumnsContainer>

            <ColumnsContainer>
                <div className="form-group">
                    <Label className="required">Suburb</Label>
                    <Input {...register(`${prefix}.suburb`)} />
                    {e?.suburb && <p className="text-destructive text-sm">{e.suburb.message}</p>}
                </div>

                <div className="form-group">
                    <Label>Postal Code</Label>
                    <Input {...register(`${prefix}.postal_code`)} />
                </div>
            </ColumnsContainer>
        </div>
    )
}

function AddressFieldset({
    register,
    errors,
    primaryPrefix,
    secondaryPrefix,
    secondaryLabel = "Add Secondary Address",
    showSecondary = true,
    initialOpen = false,
}: AddressFieldsetProps) {
    const [open, setOpen] = useState(initialOpen)

    return (
        <Fieldset legendTitle="Address">
            <AddressFields prefix={primaryPrefix} register={register} errors={errors} />

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
                            <AddressFields prefix={secondaryPrefix} register={register} errors={errors} />
                        )}
                    </CollapsibleContent>
                </Collapsible>
            )}
        </Fieldset>
    )
}

export default AddressFieldset
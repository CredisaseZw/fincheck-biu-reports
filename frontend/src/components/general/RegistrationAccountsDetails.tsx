import useRegistrationAccounts from "@/hooks/useRegistrationAccounts"
import Fieldset from "./FieldSet"
import ColumnsContainer from "./ColumnsContainer"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Controller } from "react-hook-form"
import { Checkbox } from "../ui/checkbox"
import { Button } from "../ui/button"

function RegistrationAccountsDetails() {
    const { register, onSubmit, handleSubmit, control } = useRegistrationAccounts()
    const fields = [
        { name: "tin_number", verifiedName: "is_tin_verified",label: "TIN Number"  },
        { name: "vat_number", verifiedName: "is_vat_verified",label: "VAT Number"  },
        { name: "nssa_number",verifiedName: "is_nssa_verified",label: "NSSA Number" },
        { name: "praz_number",verifiedName: "is_praz_verified", label: "PRAZ Number" },
    ] as const

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Registration Accounts" className="flex flex-col gap-4">
                <ColumnsContainer numberOfCols={2} gapClass="gap-4">
                    {fields.map(({ name, verifiedName, label }) => (
                        <div key={name} className="form-group">
                            <Label>{label}</Label>
                            <div className="flex flex-row items-center gap-2">
                                <Input
                                    type="number"
                                    className="flex-1"
                                    {...register(name, {
                                        setValueAs: (v: string) => v === "" ? undefined : Number(v),
                                    })}
                                />
                                <Controller
                                    control={control}
                                    name={verifiedName}
                                    render={({ field }) => (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <Label className="cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                                Verified
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    ))}
                </ColumnsContainer>

                <div className="flex justify-end">
                    <Button type="submit">Submit</Button>
                </div>
            </Fieldset>
        </form>
    )
}

export default RegistrationAccountsDetails
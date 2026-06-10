import useEmploymentInformation, { type EmploymentFormData } from "@/hooks/useEmploymentInformation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"
import { Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

function EmploymentInformation() {
    const { register, handleSubmit, errors, control } = useEmploymentInformation()

    const onSubmit = (data: EmploymentFormData) => console.log(data)

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Employment Information" className="flex flex-col gap-4">
                <ColumnsContainer numberOfCols={3} gapClass="gap-4">
                    <div className="form-group">
                        <Label>Employment Status</Label>
                        <Controller
                            control={control}
                            name="employment_status"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="employed">Employed</SelectItem>
                                        <SelectItem value="self_employed">Self Employed</SelectItem>
                                        <SelectItem value="unemployed">Unemployed</SelectItem>
                                        <SelectItem value="part_time">Part Time</SelectItem>
                                        <SelectItem value="retired">Retired</SelectItem>
                                        <SelectItem value="student">Student</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className="form-group">
                        <Label>Employer</Label>
                        <Input {...register("employer")} />
                    </div>

                    <div className="form-group">
                        <Label>Position</Label>
                        <Input {...register("position")} />
                    </div>
                </ColumnsContainer>
                <ColumnsContainer>
                    <div className="form-group">
                        <Label>Previous Employer</Label>
                        <Input {...register("previous_employer")} />
                    </div>

                    <div className="form-group">
                        <Label>Years Employed</Label>
                        <Input
                            type="number"
                            {...register("years_employed", {
                                setValueAs: (v: string) => v === "" ? undefined : Number(v),
                            })}
                        />
                        {errors.years_employed && (
                            <p className="text-destructive text-sm">{errors.years_employed.message}</p>
                        )}
                    </div>
                </ColumnsContainer>
                <div className="form-group">
                    <Label>Monthly Income</Label>
                    <Input
                        type="number"
                        step="0.01"
                        {...register("monthly_income", {
                            setValueAs: (v: string) => v === "" ? undefined : Number(v),
                        })}
                    />
                </div>
                <div className="flex justify-end">
                    <Button type="submit">Submit</Button>
                </div>

            </Fieldset>
        </form>
    )
}

export default EmploymentInformation
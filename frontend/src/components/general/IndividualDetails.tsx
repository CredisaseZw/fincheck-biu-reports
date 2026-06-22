import useIndividualDetails, { type IndividualFormData } from "@/hooks/useIndividualDetails"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"
import AddressFieldset from "./AddressFields";
import CustomSubmitButton from "./CustomSubmitButton";

interface props{
    individual_details? : IndividualFormData | undefined
}

function IndividualDetails({ individual_details } : props) {
    const { 
        isPending,
        errors,
        control, 
        onSubmit,
        register,
        handleSubmit,
     } = useIndividualDetails(individual_details)
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Fieldset legendTitle="Individual Details" className="flex flex-col gap-4">

                <ColumnsContainer numberOfCols={3} gapClass="gap-4">
                    <div className="form-group">
                        <Label className="required">Full Name</Label>
                        <Input {...register("full_name")} />
                        {errors.full_name && <p className="text-destructive text-sm">{errors.full_name.message}</p>}
                    </div>

                    <div className="form-group">
                        <Label className="required">National ID / Passport</Label>
                        <Input {...register("national_id")} />
                        {errors.national_id && <p className="text-destructive text-sm">{errors.national_id.message}</p>}
                    </div>

                    <div className="form-group">
                        <Label className="required">Date of Birth</Label>
                        <Input type="date" {...register("date_of_birth")} />
                        {errors.date_of_birth && <p className="text-destructive text-sm">{errors.date_of_birth.message}</p>}
                    </div>
                </ColumnsContainer>
                <div className="form-group">
                    <Label>Email</Label>
                    <Input type="email" {...register("email")} />
                    {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                </div>
                <ColumnsContainer>
                    <div className="form-group">
                        <Label className="required">Gender</Label>
                        <Input {...register("gender")} placeholder="e.g. Male, Female" />
                        {errors.gender && <p className="text-destructive text-sm">{errors.gender.message}</p>}
                    </div>

                    <div className="form-group">
                        <Label className="required">Nationality</Label>
                        <Input {...register("nationality")} />
                        {errors.nationality && <p className="text-destructive text-sm">{errors.nationality.message}</p>}
                    </div>

                    <div className="form-group">
                        <Label className="required">Mobile Number</Label>
                        <Input {...register("mobile_number")} />
                        {errors.mobile_number && <p className="text-destructive text-sm">{errors.mobile_number.message}</p>}
                    </div>

                   <div className="form-group">
                        <Label>Marital Status</Label>
                        <Controller
                            control={control}
                            name="marital_status"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select marital status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">Single</SelectItem>
                                        <SelectItem value="married">Married</SelectItem>
                                        <SelectItem value="divorced">Divorced</SelectItem>
                                        <SelectItem value="widowed">Widowed</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.marital_status && <p className="text-destructive text-sm">{errors.marital_status.message}</p>}
                    </div>

                </ColumnsContainer>
                <AddressFieldset
                    showRequired
                    control={control}
                    register={register}
                    errors={errors}
                    primaryPrefix="residential_address"
                    showSecondary = {false}
                />

                <CustomSubmitButton
                    isPending = {isPending}
                />
            </Fieldset>
        </form>
    )
}

export default IndividualDetails
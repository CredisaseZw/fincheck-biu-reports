import useCompanyDetails, { type CompanyFormData } from "@/hooks/useCompanyDetails"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"
import { Controller } from "react-hook-form"
import AddressFieldset from "./AddressFields";
import CustomSubmitButton from "./CustomSubmitButton";
import type { EntityValue } from "@/types/core";
import { Switch } from "../ui/switch";

interface props {
    subject_type : EntityValue | null
    onSuccess?: (id: number) => void
    report_id?: number | undefined
    company_overview? : CompanyFormData | undefined
}

function CompanyDetails({
    company_overview,
    report_id,
    subject_type,
    onSuccess
} : props) {
    const {
        handleSubmit,
        register,
        onSubmit,
        isPending,
        control,
        touched, 
        errors
    } = useCompanyDetails({
        onSuccess,
        company_overview,
        subject_type,
        report_id
    })

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Fieldset legendTitle="Company Information" className="flex flex-col gap-4">
                    <ColumnsContainer numberOfCols={2}>
                        <div className="form-group">
                            <Label className="required">Registered Name</Label>
                            <Input {...register("registered_name")} />
                            {errors.registered_name && (
                                <p className="text-destructive text-sm">{errors.registered_name.message}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <Label className="required">Trading Name</Label>
                            <Input {...register("trading_name")} />
                            {errors.trading_name && (
                                <p className="text-destructive text-sm">{errors.trading_name.message}</p>
                            )}
                        </div>
                    </ColumnsContainer>
                    <ColumnsContainer>
                        <div className="form-group">
                            <Label>Registration Number</Label>
                            <Input {...register("registration_number")} />    
                        </div>
                        <div className="form-group">
                            <Label>Date of Registration</Label>
                            <Input type="date" {...register("date_of_registration")} />
                        </div>
                    </ColumnsContainer>
                    <ColumnsContainer numberOfCols={3}>
                        <div className="form-group">
                            <Label>Email</Label>
                            <Input type="email" {...register("email")} />
                            {errors.email && (
                                <p className="text-destructive text-sm">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <Label>Telephone</Label>
                            <Input {...register("telephone_number")} />
                        </div>

                        <div className="form-group">
                            <Label>Mobile</Label>
                            <Input {...register("mobile_number")} />
                        </div>
                    </ColumnsContainer>
                    <div className="form-group">
                        <Label>Website</Label>
                        <Input {...register("website")} />
                        {errors.website && (
                            <p className="text-destructive text-sm">{errors.website.message}</p>
                        )}
                    </div>
                    <AddressFieldset
                        showRequired
                        register={register}
                        errors={errors}
                        control={control}
                        primaryPrefix="address_registered"
                        secondaryPrefix="address_operations"
                        secondaryLabel="Add Operations Address"
                        initialOpen={false}
                    />
                    <Controller
                        control={control}
                        name={"is_address_registered_verified"}
                        render={({field})=>(
                            <div className="p-5 dark:bg-[#1A2330]/10 bg-gray-50 rounded border">
                                <div className="flex flex-row justify-between cursor-pointer">
                                    <label className="flex flex-col gap-1" htmlFor="is_verified">
                                        <span className="font-semibold text-[1rem] text-gray-800 dark:text-gray-200">Address Verification</span>
                                        <span className="text-muted-foreground">Was the registered address visited</span>
                                    </label>
                                    <Switch
                                        className="self-center"
                                        id="is_verified"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </div>          
                            </div>
                        )}
                    />
                    <CustomSubmitButton
                        state={touched}
                        isPending={isPending}
                    />
                </Fieldset>
            </form>
        </div>
    )
}

export default CompanyDetails
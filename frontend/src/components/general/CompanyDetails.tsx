import useCompanyDetails, { type CompanyFormData } from "@/hooks/useCompanyDetails"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"
import { Controller } from "react-hook-form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import AddressFieldset from "./AddressFields";
import { numericField } from "@/constants";
import CustomSubmitButton from "./CustomSubmitButton";
import type { EntityValue } from "@/types/core";

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
        getValues,
        handleSubmit,
        register,
        onSubmit,
        isPending,
        control,
        errors 
    } = useCompanyDetails({
        company_overview,
        subject_type,
        report_id,
        onSuccess
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
                            <Label>Trading Name</Label>
                            <Input {...register("trading_name")} />
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
                    <ColumnsContainer numberOfCols={3} gapClass="gap-4">
                        <div className="form-group">
                            <Label>Date of Registration</Label>
                            <Input type="date" {...register("overview.date_of_registration")} />
                        </div>
                        <div className="form-group">
                            <Label>Number of Employees</Label>
                            <Input type="number" {...register("overview.number_of_employees", numericField)} />
                        </div>

                        <div className="form-group">
                            <Label>Last Financial Result</Label>
                            <Input {...register("overview.last_financial_result")} />
                        </div>
                    </ColumnsContainer>
                    <ColumnsContainer>
                         <div className="form-group">
                            <Label>Net Asset Value</Label>
                            <Input {...register("overview.net_asset_value")} />
                        </div>

                        <div className="form-group">
                            <Label>Authorized Share Capital</Label>
                            <Input {...register("overview.authorized_share_capital")} />
                        </div>
                    </ColumnsContainer>
                    <div className="form-group">
                        <Label>Issued Share Capital</Label>
                        <Input {...register("overview.issued_share_capital")} />
                    </div>
                    <ColumnsContainer numberOfCols={4}>
                        <div className="form-group">
                            <Label>Trading Status</Label>
                            <Controller
                                control={control}
                                key = {getValues(`overview.trading_status`)}
                                name="overview.trading_status"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="form-group">
                            <Label>Legal Form</Label>
                            <Controller
                                control={control}
                                key = {getValues(`overview.legal_form`)}
                                name="overview.legal_form"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select legal form" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="llc">LLC</SelectItem>
                                            <SelectItem value="plc">PLC</SelectItem>
                                            <SelectItem value="sole_trader">Sole Trader</SelectItem>
                                            <SelectItem value="partnership">Partnership</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="form-group">
                            <Label>Condition</Label>
                            <Controller
                                control={control}
                                key = {getValues(`overview.condition`)}
                                name="overview.condition"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select condition" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="good">Good</SelectItem>
                                            <SelectItem value="fair">Fair</SelectItem>
                                            <SelectItem value="poor">Poor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="form-group">
                            <Label>Trend</Label>
                            <Controller
                                control={control}
                                key = {getValues(`overview.trend`)}
                                name="overview.trend"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select trend" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="improving">Improving</SelectItem>
                                            <SelectItem value="stable">Stable</SelectItem>
                                            <SelectItem value="declining">Declining</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </ColumnsContainer>
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
                    <CustomSubmitButton 
                        isPending = {isPending}
                    />
                </Fieldset>
            </form>
        </div>
    )
}

export default CompanyDetails
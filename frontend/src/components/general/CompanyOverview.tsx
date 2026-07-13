import Fieldset from "./FieldSet";
import { toCap } from "@/lib/utils";
import { numericField } from "@/constants";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import useCompanyOverview, { LegalForms } from "@/hooks/useCompanyOverview";
import { Label } from "../ui/label";
import { Controller } from "react-hook-form";
import { Input } from "../ui/input";
import ColumnsContainer from "./ColumnsContainer";
import type { CompanyOverviewProps } from "@/types/core";
import CustomSubmitButton from "./CustomSubmitButton";

export default function CompanyOverview({
    subject_object_id,
    subject_type,
    report_id,
    company_overview
}:CompanyOverviewProps) {
    const {
        handleSubmit,
        register,
        onSubmit,
        getValues,
        touched,
        isPending,
        control,
    } = useCompanyOverview({
        subject_object_id,
        subject_type,
        report_id,
        company_overview
    })
    return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <Fieldset legendTitle="Company Overview">
            <ColumnsContainer numberOfCols={4}>
                <div className="form-group">
                    <Label>Trading Status</Label>
                    <Controller
                        control={control}
                        key = {getValues(`trading_status`)}
                        name="trading_status"
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="administration">Administration</SelectItem>
                                    <SelectItem value="insolvent">Insolvent</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="form-group">
                    <Label>Legal Form</Label>
                    <Controller
                        control={control}
                        key = {getValues(`legal_form`)}
                        name="legal_form"
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select legal form" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        LegalForms.map((item, id)=>(
                                            <SelectItem key={id} value={item}>{toCap(item)}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                    <div className="form-group">
                        <Label>Condition</Label>
                        <Controller
                            control={control}
                            key = {getValues(`condition`)}
                            name="condition"
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
                        key = {getValues(`trend`)}
                        name="trend"
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
            <ColumnsContainer gapClass="gap-4">    
                <div className="form-group">
                    <Label>Number of Employees</Label>
                    <Input type="number" {...register("number_of_employees", numericField)} />
                </div>

                <div className="form-group">
                    <Label>Last Financial Result</Label>
                    <Input {...register("last_financial_result")} />
                </div>
            </ColumnsContainer>    
            <div className="form-group">
                <Label>Issued Share Capital</Label>
                <Input {...register("issued_share_capital")} />
            </div>

            <ColumnsContainer>
                <div className="form-group">
                    <Label>Net Asset Value</Label>
                    <Input {...register("net_asset_value")} />
            </div>

                <div className="form-group">
                    <Label>Authorized Share Capital</Label>
                    <Input {...register("authorized_share_capital")} />
                </div>
            </ColumnsContainer>
            <CustomSubmitButton 
                state = {touched}
                isPending = {isPending}
            />
        </Fieldset>
    </form>
    )
}

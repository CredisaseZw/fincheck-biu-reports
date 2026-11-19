import useCompanyManagement, { emptyManagementMember } from "@/hooks/useCompanyManagement";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import Fieldset from "./FieldSet";
import CustomSubmitButton from "./CustomSubmitButton";
import ManagementMemberCard from "./ManagementMemberCard";
import type { CompanyManagementProps } from "@/types/core";

function CompanyManagement({
    management_data,
    subject_object_id,
    subject_type,
    report_id
}: CompanyManagementProps) {
    const {
        register,
        control,
        errors,
        watch,
        setValue,
        handleSubmit,
        onSubmit,
        onTouched,
        isPending,
        touched,
        fields,
        append,
        remove,
    } = useCompanyManagement({
        management_data,
        subject_object_id,
        subject_type,
        report_id
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Company Management" className="flex flex-col gap-4">
                <ManagementMemberCard
                    heading="Executive Head"
                    base="executive_head"
                    role="executive_head"
                    subject_object_id={subject_object_id}
                    register={register}
                    control={control}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                />
                <ManagementMemberCard
                    heading="Finance Head"
                    base="finance_head"
                    role="finance_head"
                    subject_object_id={subject_object_id}
                    register={register}
                    control={control}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                />

                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <Label>Others - Management</Label>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append(emptyManagementMember())}
                        >
                            <Plus size={16} className="mr-2" /> Add Manager
                        </Button>
                    </div>
                    {
                        fields.length === 0 &&
                        <span className="text-muted-foreground text-sm text-center">
                            No other managers added.
                        </span>
                    }
                    {
                        fields.map((field, index) => (
                            <ManagementMemberCard
                                key={field.id}
                                heading={`Manager ${index + 1}`}
                                base={`others.${index}`}
                                role="manager"
                                subject_object_id={subject_object_id}
                                register={register}
                                control={control}
                                errors={errors}
                                watch={watch}
                                setValue={setValue}
                                onRemove={() => remove(index)}
                            />
                        ))
                    }
                </div>

                <CustomSubmitButton
                    onFine={onTouched}
                    showFine={Boolean(report_id)}
                    state={touched}
                    isPending={isPending}
                />
            </Fieldset>
        </form>
    )
}

export default CompanyManagement

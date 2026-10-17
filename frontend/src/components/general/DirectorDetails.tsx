import useDirectors from "@/hooks/useDirectors"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Fieldset from "./FieldSet"
import type { CompanyDirectorsProps } from "@/types/core";
import CustomSubmitButton from "./CustomSubmitButton";
import DirectorRow from "./DirectorRow";

function DirectorDetails({
    directors_data,
    subject_object_id,
    subject_type,
    report_id
}: CompanyDirectorsProps) {
    const {
        touched, 
        errors,
        fields,
        control,
        isPending, 
        onDelete,    
        getValues,
        setValue,
        watch,
        register, 
        handleSubmit,
        onTouched,
        onSubmit,
        append,
        remove 
    } = useDirectors({
        directors_data,
        subject_object_id,
        subject_type,
        report_id
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Directors" className="flex flex-col gap-4">
                {fields.map((field, index) => (
                    <DirectorRow 
                        key={field.id}
                        index={index}
                        field={field}
                        remove={remove}
                        onDelete={onDelete}
                        getValues={getValues}
                        setValue={setValue}
                        watch={watch}
                        register={register}
                        errors={errors}
                        control={control}
                    />
                ))}
                {
                    fields.length === 0 &&
                    <span className="text-muted-foreground text-center">No directors added.</span>
                }
                <div className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        className="self-start"
                        onClick={() => append({
                            full_name: "",
                            is_pep : false,
                            position: "director",
                            gender: "male",
                            date_of_birth: undefined,
                            national_id : "",
                            residential_address: "",
                            address_prev: "",
                            email: "",
                            mobile_number: "",
                        })}
                    >
                        <Plus size={16} className="mr-2" /> Add Director
                    </Button>
                    <CustomSubmitButton
                        onFine={onTouched}
                        showFine
                        state={touched}
                        isPending={isPending}
                    />
                </div>

            </Fieldset>
        </form>
    )
}

export default DirectorDetails
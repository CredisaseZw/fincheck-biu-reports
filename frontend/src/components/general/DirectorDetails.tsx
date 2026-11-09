import useDirectors from "@/hooks/useDirectors"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Fieldset from "./FieldSet"
import type { CompanyDirectorsProps } from "@/types/core";
import CustomSubmitButton from "./CustomSubmitButton";
import DirectorRow from "./DirectorRow";
import ColumnsContainer from "./ColumnsContainer";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import SearchEntity from "./SearchEntity";

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
        default_search,
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
                        subject_object_id = {subject_object_id}
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
            
                </div>
                <Fieldset legendTitle="Company Secretary" className="flex justify-end">
                    <ColumnsContainer>
                        <div className="form-group">
                            <Label>Company</Label>
                            <SearchEntity
                                entityType={"company"}
                                defaultSearch={default_search}
                                onClear={()=> {
                                    setValue("company_company_secretary.secretary", undefined)
                                    setValue("company_company_secretary.secretary_name", undefined)
                                }}
                                onSelectItem={(id: number) =>{
                                    setValue("company_company_secretary.secretary", id);
                                }}
                            /> 
                        </div>
                        <div className="form-group mt-1">
                            <Label>Date of appointment</Label>
                            <Input
                                {
                                    ...register("company_company_secretary.date_of_appointment")
                                }
                                type={"date"}
                            />
                        </div>
                    </ColumnsContainer>
                </Fieldset>
                <CustomSubmitButton
                    onFine={onTouched}
                    showFine
                    state={touched}
                    isPending={isPending}
                />
            </Fieldset>
        </form>
    )
}

export default DirectorDetails
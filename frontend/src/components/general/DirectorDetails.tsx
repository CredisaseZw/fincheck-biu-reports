import useDirectors from "@/hooks/useDirectors"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"
import { Textarea } from "../ui/textarea";
import type { CompanyDirectorsProps } from "@/types/core";
import CustomSubmitButton from "./CustomSubmitButton";

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
        register, 
        handleSubmit,
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
                    <div key={field.id} className="flex flex-col gap-3 border rounded-md p-4">

                        <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-muted-foreground">
                                Director {index + 1}
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    const id = getValues(`directors.${index}.id`)
                                    remove(index)
                                    if(id){
                                        onDelete(id)
                                    }
                                }}
                            >
                                <Trash2 size={16} className="text-destructive" />
                            </Button>
                        </div>

                        <ColumnsContainer numberOfCols={3} gapClass="gap-4">
                            <div className="form-group">
                                <Label className="required">Full Name</Label>
                                <Input {...register(`directors.${index}.full_name`)} />
                                {errors.directors?.[index]?.full_name && (
                                    <p className="text-destructive text-sm">{errors.directors[index].full_name.message}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <Label className="required">Email</Label>
                                <Input type="email" {...register(`directors.${index}.email`)} />
                                {errors.directors?.[index]?.email && (
                                    <p className="text-destructive text-sm">{errors.directors[index].email.message}</p>
                                )}
                            </div>
                            <div className="form-group">
                                <Label>Mobile Number</Label>
                                <Input {...register(`directors.${index}.mobile_phone_number`)} />
                            </div>
                        </ColumnsContainer>
                        <ColumnsContainer>
                            <div className="form-group">
                                <Label className="required">Position</Label>
                                <Controller
                                    control={control}
                                    name={`directors.${index}.position`}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select position" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="director">Director</SelectItem>
                                                <SelectItem value="secretary">Secretary</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="form-group">
                                <Label className="required">Gender</Label>
                                <Controller
                                    control={control}
                                    name={`directors.${index}.gender`}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </ColumnsContainer>
                        <ColumnsContainer>
                            <div className="form-group">
                                <Label>Date of Birth</Label>
                                <Input type="date" {...register(`directors.${index}.dob`)} />
                            </div>
                            <div className="form-group">
                                <Label className="required">National ID / Passport ID</Label>
                                <Input {...register(`directors.${index}.national_id`)} placeholder="69235489C67 or ZN1234567" />
                                {errors.directors?.[index]?.national_id && (
                                    <p className="text-destructive text-sm">{errors.directors[index].national_id.message}</p>
                                )}
                            </div>
                        </ColumnsContainer>
                    
                        <ColumnsContainer>
                            <div className="form-group">
                                <Label className="required">Latest Address</Label>
                                <Textarea {...register(`directors.${index}.address_latest`)} />
                                {errors.directors?.[index]?.address_latest && (
                                    <p className="text-destructive text-sm">{errors.directors[index].address_latest.message}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <Label>Previous Address</Label>
                                <Textarea {...register(`directors.${index}.address_prev`)} />
                            </div>
                        </ColumnsContainer>
                        <div className="form-group">
                            <Label>Insolvencies, Judgements, Defaults</Label>
                            <Textarea {...register(`directors.${index}.insolvencies_judgements`)} />
                        </div>
                    </div>
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
                            position: "director",
                            gender: "male",
                            dob: "",
                            national_id : "",
                            address_latest: "",
                            address_prev: "",
                            email: "",
                            mobile_phone_number: "",
                        })}
                    >
                        <Plus size={16} className="mr-2" /> Add Director
                    </Button>
                    <CustomSubmitButton
                        state={touched}
                        isPending={isPending}
                    />
                </div>

            </Fieldset>
        </form>
    )
}

export default DirectorDetails
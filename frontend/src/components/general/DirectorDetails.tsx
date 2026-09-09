import useDirectors from "@/hooks/useDirectors"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Trash2, Plus, RotateCw } from "lucide-react"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"
import { Textarea } from "../ui/textarea";
import type { CompanyDirectorsProps, Individual } from "@/types/core";
import CustomSubmitButton from "./CustomSubmitButton";
import { Checkbox } from "../ui/checkbox";
import { useState, useEffect } from "react";
import { handleAxiosError, normalize_national_id, toCap } from "@/lib/utils";
import { api } from "@/axios/api";
import { CLEAR_MESSAGE, GENDER_OPTIONS } from "@/constants";
import { toast } from "sonner";
import LoadingIndicator from "./LoadingIndicator";

const DirectorRow = ({ 
    index, 
    field, 
    remove, 
    onDelete, 
    getValues, 
    register, 
    errors, 
    control, 
    watch, 
    setValue 
}: any) => {
    const [isChecking, setIsChecking] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const nationalId = watch(`directors.${index}.national_id`);
    const id = watch(`directors.${index}.id`)


    useEffect(() => {
        if (!nationalId) return;
        if (nationalId === field.national_id) return;
        const nidRegex = /^\d{2}\d{6,7}[A-Za-z]\d{2}$/;
        const passportRegex = /^[A-Za-z]{2}\d{7}$/;
        
        if (nidRegex.test(nationalId) || passportRegex.test(nationalId)) {
            const checkData = async () => {
                try {
                    setIsChecking(true);
                    const res = await api.get(`/api/individuals/lookup/?national_id=${normalize_national_id(nationalId)}`);
                    if (res.data) {
                        const ind = res.data;
                        if (ind.id) setValue(`directors.${index}.id`, ind.id)
                        if (ind.full_name) setValue(`directors.${index}.full_name`, ind.full_name, { shouldValidate: true });
                        if (ind.gender) setValue(`directors.${index}.gender`, ind.gender.toLocaleLowerCase(), { shouldValidate: true });
                        if (ind.date_of_birth) setValue(`directors.${index}.date_of_birth`, ind.date_of_birth, { shouldValidate: true });
                        if (ind.mobile_number) setValue(`directors.${index}.mobile_number`, ind.mobile_number, { shouldValidate: true });
                        if (ind.email) setValue(`directors.${index}.email`, ind.email, { shouldValidate: true });
                        if (ind.residential_address) setValue(`directors.${index}.residential_address`, ind.residential_address, { shouldValidate: true });
                        if (ind.insolvencies_judgements)  setValue(`directors.${index}.insolvencies_judgements`, ind.insolvencies_judgements, { shouldValidate: true });
                    }
                } catch (error) { 
                    console.log(error)
                } finally {
                    setIsChecking(false);
                }
            };            
            checkData();
        }
    }, [nationalId, index, setValue, field.national_id]);

    const refreshJudgements = async() => {
        if(!id){
            toast.error("Invalid user",{description :"User not yet saved in the BizSafe system."})
            return;
        }

        try{
            setIsRefreshing(true)
            const response  = await api.post<Individual>("/api/refresh-credits/", {
                "entity_type": "individual",
                "entity_identifier": id
            });
            if (response.data){
                if (response.data.insolvencies_judgements){
                    setValue(`directors.${index}.insolvencies_judgements`, response.data.insolvencies_judgements, { shouldValidate: true })
                }else {
                    setValue(`directors.${index}.insolvencies_judgements`, undefined)
                }
            }   
        }catch (error){handleAxiosError(error)}
        finally{setIsRefreshing(false)}
    }

    return (
        <div key={field.id} className="flex flex-col gap-3 border rounded-md p-4">
            <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-muted-foreground">
                    Director {index + 1}
                </p>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isChecking}
                    onClick={() => {
                        const id = getValues(`directors.${index}.id`)
                        remove(index)
                        if(id){ onDelete(id) }
                    }}
                >
                    <Trash2 size={16} className="text-destructive" />
                </Button>
            </div>

            <ColumnsContainer numberOfCols={3} gapClass="gap-4">
                <div className="form-group flex-1">
                    <Label className="required">National ID / Passport ID</Label>
                    <Input 
                        {...register(`directors.${index}.national_id`)} 
                        placeholder="e.g 69235489C67 or ZN1234567" 
                    />
                    {errors.directors?.[index]?.national_id && (
                        <p className="text-destructive text-sm">{errors.directors[index].national_id.message}</p>
                    )}
                </div>
           
                <div className="form-group">
                    <Label className="required">Full Name</Label>
                    <Input {...register(`directors.${index}.full_name`)} disabled={isChecking} />
                    {errors.directors?.[index]?.full_name && (
                        <p className="text-destructive text-sm">{errors.directors[index].full_name.message}</p>
                    )}
                </div>

                <div className="form-group">
                    <Label>Email</Label>
                    <Input type="email" {...register(`directors.${index}.email`)} disabled={isChecking} />
                    {errors.directors?.[index]?.email && (
                        <p className="text-destructive text-sm">{errors.directors[index].email.message}</p>
                    )}
                </div>
            </ColumnsContainer>
            
            <ColumnsContainer>
                <div className="form-group">
                    <Label className="required">Position</Label>
                    <Controller
                        control={control}
                        name={`directors.${index}.position`}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isChecking}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="director">Director</SelectItem>
                                    <SelectItem value="secretary">Secretary</SelectItem>
                                    <SelectItem value="chairman">Chairman</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.directors?.[index]?.position && (
                        <p className="text-destructive text-sm">{errors.directors[index].position.message}</p>
                    )}
                </div>

                <div className="form-group">
                    <Label className="required">Gender</Label>
                    <Controller
                        control={control}
                        name={`directors.${index}.gender`}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isChecking}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        GENDER_OPTIONS.map((genderOption) => (
                                            <SelectItem key={genderOption} value={genderOption}>{toCap(genderOption)}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.directors?.[index]?.gender && (
                        <p className="text-destructive text-sm">{errors.directors[index].gender.message}</p>
                    )}
                </div>
            </ColumnsContainer>
            
            <ColumnsContainer numberOfCols={2}>
                <div className="form-group">
                    <Label>Date of Birth</Label>
                    <Input type="date" {...register(`directors.${index}.date_of_birth`)} disabled={isChecking} />
                    {errors.directors?.[index]?.date_of_birth && (
                        <p className="text-destructive text-sm">{errors.directors[index].date_of_birth.message}</p>
                    )}
                </div>
                <div className="flex flex-row gap-3">
                    <div className="form-group flex-1">
                        <Label>Mobile Number</Label>
                        <Input {...register(`directors.${index}.mobile_number`)} disabled={isChecking} />
                        {errors.directors?.[index]?.mobile_number && (
                            <p className="text-destructive text-sm">{errors.directors[index].mobile_number.message}</p>
                        )}
                    </div>
                    <Controller
                        control={control}
                        name={`directors.${index}.is_pep`}
                        render={({ field }) => (
                        <div className="flex items-center gap-2 mt-4">
                            <Checkbox
                                id={`is_pep_d_${index}`}
                                checked={field.value}
                                disabled={isChecking}
                                onCheckedChange={(val) => field.onChange(val === true)}
                            />
                            <label className="text-sm" htmlFor={`is_pep_d_${index}`}>PEP</label>
                        </div>
                        )}
                    />
                </div>
            </ColumnsContainer>
        
            <ColumnsContainer>
                <div className="form-group">
                    <Label className="required">Latest Address</Label>
                    <Textarea {...register(`directors.${index}.residential_address`)} disabled={isChecking} />
                    {errors.directors?.[index]?.residential_address && (
                        <p className="text-destructive text-sm">{errors.directors[index].residential_address.message}</p>
                    )}
                </div>

                <div className="form-group">
                    <Label>Previous Address</Label>
                    <Textarea {...register(`directors.${index}.address_prev`)} disabled={isChecking} />
                    {errors.directors?.[index]?.address_prev && (
                        <p className="text-destructive text-sm">{errors.directors[index].address_prev.message}</p>
                    )}
                </div>
            </ColumnsContainer>
            <div className="form-group">
                <div className="card relative">
                    <Label className="mb-2.5">Insolvencies, Judgements, Defaults</Label>
                    <Button
                        onClick={refreshJudgements}
                        size={"icon-sm"}
                        type="button"
                        aria-label="Refresh insolvency records"
                        disabled = {isRefreshing}
                        className="absolute top-2.5 right-2.5 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-white/10"
                    >
                        {
                            isRefreshing 
                            ? <LoadingIndicator variant="button"/>
                            : <RotateCw/>
                        }
                    </Button>
                    {(() => {
                        const value = getValues(`directors.${index}.insolvencies_judgements`);
                        if (!value) return <p className="text-xs">{CLEAR_MESSAGE}</p>;
                        if (value.includes("\n")) {
                        return (
                            <ul>
                                {value.split("\n").filter(Boolean).map((line: string, i: number) => (
                                    <li key={i} className="text-sm">{line}</li>
                                ))}
                            </ul>
                        );
                        }
                        return <p>{value}</p>;
                    })()}
                </div>
            </div>
        </div>
    );
};

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
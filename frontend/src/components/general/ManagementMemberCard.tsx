import { useState } from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search, Trash2 } from "lucide-react";
import { api } from "@/axios/api";
import {
    CLEAR_MESSAGE,
    EXECUTIVE_HEAD_TITLES,
    FINANCE_HEAD_TITLES,
    GENDER_OPTIONS,
} from "@/constants";
import {
    getIndividualLookupValues,
    handleAxiosError,
    normalize_national_id,
    toCap,
} from "@/lib/utils";
import type { Individual, ManagementMemberCardProps } from "@/types/core";
import ColumnsContainer from "./ColumnsContainer";
import LoadingIndicator from "./LoadingIndicator";

function ManagementMemberCard({
    heading,
    base,
    role,
    subject_object_id,
    register,
    control,
    errors,
    watch,
    setValue,
    onRemove,
}: ManagementMemberCardProps) {
    const [isChecking, setIsChecking] = useState(false);
    const nationalId = watch(`${base}.national_id`);
    const directorships: string[] = watch(`${base}.directorships`) ?? [];
    const insolvencies: string | undefined = watch(`${base}.insolvencies_judgements`);
    const titles = role === "executive_head"
        ? EXECUTIVE_HEAD_TITLES
        : role === "finance_head"
            ? FINANCE_HEAD_TITLES
            : null;

    const fieldError = (name: string) => {
        return `${base}.${name}`
            .split(".")
            .reduce((acc: any, key) => acc?.[key], errors);
    };

    const onFetchData = async () => {
        if (!nationalId || isChecking) return;
        try {
            setIsChecking(true);
            const response = await api.get<Individual>(
                `/api/individuals/lookup/?national_id=${normalize_national_id(nationalId)}`
            );
            if (!response.data) return;
            const values = getIndividualLookupValues(response.data, subject_object_id ?? undefined);
            Object.entries(values).forEach(([key, value]) => {
                setValue(`${base}.${key}`, value, { shouldValidate: true });
            });
        } catch (error) {
            handleAxiosError(error);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 border rounded-md p-4">
            <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-muted-foreground">
                    {heading}
                </p>
                {
                    onRemove &&
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onRemove}
                    >
                        <Trash2 size={16} className="text-destructive" />
                    </Button>
                }
            </div>

            <ColumnsContainer numberOfCols={3} gapClass="gap-4">
                <div className="form-group flex-1">
                    <Label>National ID / Passport ID</Label>
                    <div className="relative">
                        <Input
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    void onFetchData();
                                }
                            }}
                            {...register(`${base}.national_id`)}
                            placeholder="e.g 69235489C67 or ZN1234567"
                        />
                        <Button
                            disabled={isChecking}
                            type="button"
                            size={"icon-sm"}
                            onClick={() => void onFetchData()}
                            className="absolute cursor-pointer right-3 flex self-center top-1.5"
                        >
                            {
                                isChecking
                                    ? <LoadingIndicator variant={"button"} />
                                    : <Search />
                            }
                        </Button>
                    </div>
                    {
                        fieldError("national_id") &&
                        <p className="text-destructive text-sm">{fieldError("national_id")?.message}</p>
                    }
                </div>

                <div className="form-group">
                    <Label>Full Name</Label>
                    <Input {...register(`${base}.full_name`)} disabled={isChecking} />
                    {
                        fieldError("full_name") &&
                        <p className="text-destructive text-sm">{fieldError("full_name")?.message}</p>
                    }
                </div>

                <div className="form-group">
                    <Label>Email</Label>
                    <Input type="email" {...register(`${base}.email`)} disabled={isChecking} />
                    {
                        fieldError("email") &&
                        <p className="text-destructive text-sm">{fieldError("email")?.message}</p>
                    }
                </div>
            </ColumnsContainer>

            <ColumnsContainer>
                <div className="form-group">
                    <Label className="required">Title</Label>
                    {
                        titles
                            ? <Controller
                                control={control}
                                name={`${base}.title`}
                                render={({ field }) => (
                                    <Select
                                        key={field.value}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        disabled={isChecking}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select title" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                titles.map((title) => (
                                                    <SelectItem key={title.value} value={title.value}>
                                                        {title.label}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            : <Input
                                {...register(`${base}.title`)}
                                disabled={isChecking}
                                placeholder="e.g Operations Manager"
                            />
                    }
                    {
                        fieldError("title") &&
                        <p className="text-destructive text-sm">{fieldError("title")?.message}</p>
                    }
                </div>

                <div className="form-group">
                    <Label>Gender</Label>
                    <Controller
                        control={control}
                        name={`${base}.gender`}
                        render={({ field }) => (
                            <Select
                                key={field.value}
                                defaultValue={field.value}
                                onValueChange={field.onChange}
                                disabled={isChecking}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        GENDER_OPTIONS.map((genderOption) => (
                                            <SelectItem key={genderOption} value={genderOption}>
                                                {toCap(genderOption)}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {
                        fieldError("gender") &&
                        <p className="text-destructive text-sm">{fieldError("gender")?.message}</p>
                    }
                </div>
            </ColumnsContainer>

            <ColumnsContainer>
                <div className="form-group">
                    <Label>Date of Birth</Label>
                    <Input type="date" {...register(`${base}.date_of_birth`)} disabled={isChecking} />
                    {
                        fieldError("date_of_birth") &&
                        <p className="text-destructive text-sm">{fieldError("date_of_birth")?.message}</p>
                    }
                </div>

                <div className="form-group">
                    <Label>Mobile Number</Label>
                    <Input {...register(`${base}.mobile_number`)} disabled={isChecking} />
                    {
                        fieldError("mobile_number") &&
                        <p className="text-destructive text-sm">{fieldError("mobile_number")?.message}</p>
                    }
                </div>
            </ColumnsContainer>

            <ColumnsContainer>
                <div className="form-group">
                    <Label>Current Address</Label>
                    <Textarea {...register(`${base}.residential_address`)} disabled={isChecking} />
                    {
                        fieldError("residential_address") &&
                        <p className="text-destructive text-sm">{fieldError("residential_address")?.message}</p>
                    }
                </div>

                <div className="form-group">
                    <Label>Previous Address</Label>
                    <Textarea {...register(`${base}.address_prev`)} disabled={isChecking} />
                    {
                        fieldError("address_prev") &&
                        <p className="text-destructive text-sm">{fieldError("address_prev")?.message}</p>
                    }
                </div>
            </ColumnsContainer>

            <div className="form-group">
                <Label>Directorships &amp; Other Positions</Label>
                <div className="card">
                    {
                        directorships.length === 0
                            ? <p className="text-xs italic text-center text-muted-foreground">
                                {"No other directorships recorded"}
                            </p>
                            : <ol className="list-decimal list-inside space-y-1 text-sm">
                                {
                                    directorships.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))
                                }
                            </ol>
                    }
                </div>
            </div>

            <div className="form-group">
                <div className="card">
                    <Label className="mb-2.5">Insolvencies, Judgements, Defaults</Label>
                    {
                        insolvencies
                            ? <p className="text-sm whitespace-pre-line">{insolvencies}</p>
                            : <p className="text-xs">{CLEAR_MESSAGE}</p>
                    }
                </div>
            </div>
        </div>
    );
}

export default ManagementMemberCard;

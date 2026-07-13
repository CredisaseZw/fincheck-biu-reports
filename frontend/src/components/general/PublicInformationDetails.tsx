import usePublicInformation from "@/hooks/usePublicInformation";
import Fieldset from "./FieldSet";
import BaseTable from "./BaseTable";
import { PUBLIC_INFORMATION_HEADERS } from "@/constants";
import { TableCell, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Trash2, Plus } from "lucide-react";
import type { PublicInformationProps } from "@/types/core";
import CustomSubmitButton from "./CustomSubmitButton";

function PublicInformationDetails({
    report_id,
    subject_object_id,
    subject_type,
    public_information_data
}: PublicInformationProps) {
    const {
        touched,
        register,
        append,
        remove,
        getValues,
        handleSubmit,
        onSubmit,
        onDelete,
        errors,
        isPending,
        fields,
    } = usePublicInformation({
        report_id,
        subject_object_id,
        subject_type,
        public_information_data
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Public Information">
                <BaseTable
                    isEmpty={fields.length === 0}
                    headers={PUBLIC_INFORMATION_HEADERS}>
                        {
                            fields.map((field, idx) => (
                                <TableRow key={field.id}>
                                    <TableCell>
                                        <Input
                                            variant="sm"
                                            type={"date"}
                                            {...register(`public_information.${idx}.record_date`)}
                                        />
                                        {errors.public_information?.[idx]?.record_date && (
                                            <p className="text-destructive text-sm">
                                                {errors.public_information?.[idx]?.record_date?.message}
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            variant="sm"
                                            placeholder="Enter summary..."
                                            {...register(`public_information.${idx}.summary`)}
                                        />
                                        {errors.public_information?.[idx]?.summary && (
                                            <p className="text-destructive text-sm">
                                                {errors.public_information?.[idx]?.summary?.message}
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            variant="sm"
                                            placeholder="https://..."
                                            {...register(`public_information.${idx}.link`)}
                                        />
                                        {errors.public_information?.[idx]?.link && (
                                            <p className="text-destructive text-sm">
                                                {errors.public_information?.[idx]?.link?.message}
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                const id = getValues(`public_information.${idx}.id`)
                                                remove(idx)
                                                if (id) {
                                                    onDelete(id)
                                                }
                                            }}
                                        >
                                            <Trash2 size={16} className="text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                </BaseTable>
                <div className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({
                            summary: "",
                            link: "",
                            record_date :""
                        })}
                    >
                        <Plus size={16} className="mr-2" /> Add Row
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

export default PublicInformationDetails

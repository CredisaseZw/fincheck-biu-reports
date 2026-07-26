import BaseTable from "@/components/general/BaseTable";
import CustomDialogueHeader from "@/components/general/CustomDialogueHeader";
import Fieldset from "@/components/general/FieldSet";
import LoadingIndicator from "@/components/general/LoadingIndicator";
import RecordDebtorSelector from "@/components/general/RecordDebtorSelector";
import SearchEntity, { type SearchEntityRef } from "@/components/general/SearchEntity";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { ReportRequestHeaders } from "@/constants";
import useClientRequestReportsDialog from "@/hooks/useClientRequestReportsDialog";
import type { EntityMode, onSelectEntityProps } from "@/types/core";
import { Plus, Trash2 } from "lucide-react";
import { Controller } from "react-hook-form";

function ClientRequestReportsDialog() {
    const {
        refs,
        control,
        errors,
        fields,
        isPending,
        open,
        setOpen,
        register,
        setValue,
        onSubmit,
        watch,
        append,
        remove,
        handleSubmit
    } = useClientRequestReportsDialog();

    return (
    <Dialog
        open = {open}
        onOpenChange={setOpen}
    >
        <DialogTrigger>
            <Button>
                <Plus/>
                Request Reports
            </Button>
        </DialogTrigger>
        <DialogContent className="md:max-w-5xl">
            <CustomDialogueHeader
                title="Request new reports."
            />
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div className="form-group"> 
                    <Label>Requestor Name</Label>
                    <Input
                        {
                            ...register("requestor")
                        }
                    />
                    {errors.requestor && <p className="text-destructive text-sm">{errors.requestor.message}</p>}
                </div>
                <Fieldset legendTitle="Reports">
                    <BaseTable 
                        isEmpty = {fields.length === 0}
                        headers={ReportRequestHeaders}>
                        {
                            fields.map((_, idx) => {
                                const setRef = (el: SearchEntityRef | null) => { refs.current[idx] = el }
                                const entityType = watch(`rows.${idx}.subject_type`)

                                return (
                                <TableRow>
                                    <TableCell className="text-center">{idx  + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <div className="flex flex-row gap-2">
                                                <Controller
                                                    control={control}
                                                    name={`rows.${idx}.subject_type`}
                                                    render={({ field }) => (
                                                        <RecordDebtorSelector
                                                            onChange={(val: string) => {
                                                                field.onChange(val)
                                                                refs.current[idx]?.clear()
                                                            }}
                                                            defaultValue={field.value}
                                                        />
                                                    )}
                                                />
                                                
                                                <SearchEntity
                                                    ref={setRef}
                                                    entityType={entityType}
                                                    entityMode="subject"
                                                    onSelectEntity={( _:EntityMode, v: onSelectEntityProps)=>{
                                                        setValue(`rows.${idx}.subject_object_id`, v.id)
                                                        if(v.uniqueID) setValue(`rows.${idx}.unique_id`, v.uniqueID);
                                                    }}
                                                />
                                            </div>
                                            
                                            {errors.rows?.[idx]?.subject_type && (
                                                <p className="text-destructive text-sm">{errors.rows[idx].subject_type.message}</p>
                                            )}
                                            {errors.rows?.[idx]?.subject_object_id && (
                                                <p className="text-destructive text-sm">{errors.rows[idx].subject_object_id.message}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            { ...register(`rows.${idx}.unique_id`) }
                                        />
                                    </TableCell>
                                    <TableCell className="flex justify-center items-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>remove(idx)}
                                        >
                                            <Trash2 size={16} className="text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )})
                        }  
                    </BaseTable>
                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({
                                subject_type : "company",
                                subject_object_id : 0
                            })}
                        >
                            <Plus size={16} className="mr-2" /> Add Row
                        </Button>
                    </div>
                </Fieldset>
                <div className="flex flex-row gap-2 justify-end">
                    <Button 
                        disabled = {isPending}
                        type="button"
                        variant={"ghost"}>
                        Cancel
                    </Button>
                    <Button
                        disabled = {isPending}
                        type ="submit"
                    >    
                        {
                            isPending && <LoadingIndicator variant="button"/>
                        }
                        Submit
                    </Button>
                </div>
            </form>
        </DialogContent>
    </Dialog>   
  )
}

export default ClientRequestReportsDialog
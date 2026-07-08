import ColumnsContainer from "@/components/general/ColumnsContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useFilterOptionsDialogue from "@/hooks/useFilterOptionsDialogue";
import { Sliders } from "lucide-react";
import { Controller } from "react-hook-form";

interface props {
    showFinalized?: boolean
}

function FilterOptionsDialogue({showFinalized}:props) {
    const {
        onSubmit,
        onClear,
        handleSubmit,
        register,
        getValues,
        control,
    } = useFilterOptionsDialogue()
    return (
    <Popover>
        <PopoverTrigger>
            <Button variant={"outline"}>
                <Sliders/>
                Filter Report
            </Button>
        </PopoverTrigger>
        <PopoverContent className="rounded">
            <form 
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4">
                {
                    !showFinalized &&
                    <div className="flex flex-col gap-1">
                        <Label>Status</Label>
                        <Controller
                            key={getValues(`status`)}
                            control={control}
                            name = "status"
                            render={({field}) => (
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger size="sm" className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                }
                <ColumnsContainer numberOfCols={showFinalized ? 2 : 1}>
                    <div className="flex flex-col gap-1">
                        <Label>Date from</Label>
                        <Input
                            {...register("date_from")}
                            type="date"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>Date to</Label>
                        <Input
                            {...register("date_to")}
                            type="date"
                        />
                    </div>
                </ColumnsContainer>
                {
                    showFinalized &&
                <>               
                    <div className="flex flex-col gap-1">
                        <Label>Finalized from</Label>
                        <Input
                            {...register("finalized_from")}
                            type="date"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>Finalized To</Label>
                        <Input
                            type="date"
                            {...register("finalized_to")}
                        />
                    </div>    
                </>
                }
                <div className="flex flex-row justify-end">                    
                    <Button 
                        onClick={()=> onClear()}
                        type="button"
                        variant={"ghost"}>
                        Clear
                    </Button>
                    <Button type="submit">
                        Apply
                    </Button>
                </div>

            </form>
        </PopoverContent>
    </Popover>
  )
}

export default FilterOptionsDialogue
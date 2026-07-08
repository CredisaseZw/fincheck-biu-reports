import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useURLParamsFilter from "./useURLParamsFilter";

const Status = z.enum(["draft", "in_progress", "suspended"])
const schema = z.object({
    status: Status.optional(),
    date_from : z.string().optional(),
    date_to : z.string().optional(),
    finalized_from : z.string().optional(),
    finalized_to : z.string().optional()
})

export type FiltersFormData = z.infer<typeof schema>
function useFilterOptionsDialogue() {   
    const {
        reset,
        register,
        handleSubmit,
        getValues,
        control,
        formState : {errors}
    } =useForm<FiltersFormData>({
        resolver: zodResolver(schema),
    })  
    const {updateFilters, resetFilters} = useURLParamsFilter()
    const onSubmit = (data: FiltersFormData) =>updateFilters(data)
    const onClear = ()=>{reset(undefined); resetFilters()}

    return {
        getValues,
        onSubmit,
        onClear,
        handleSubmit,
        register,
        control,
        errors
    }
}

export default useFilterOptionsDialogue
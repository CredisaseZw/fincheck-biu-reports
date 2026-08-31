import { OptionButton } from "@/components/general/OptionButton";
import { AlertDialog,AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import useInstanceMutation from "@/hooks/api/useInstanceMutation";
import useURLParamsFilter from "@/hooks/useURLParamsFilter";
import { handleAxiosError, toCap } from "@/lib/utils";
import type { EntityInformationProps, EntityValue } from "@/types/core";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteEntityDialog({
    entity_type, 
    id
}:EntityInformationProps) {
    const LINKS: Record<EntityValue, string> = {
        "company" : "/api/companies/",
        "individual" : "/api/individuals/"
    }
    const { removeSingleUrlParam } = useURLParamsFilter()
    const [open, setOpen] = useState(false)
    const {mutate, isPending} = useInstanceMutation()

    const onDelete =()=>{
        mutate({url : `${LINKS[entity_type]}${id}/`, mode: "deletion"}, {
            onSuccess : ()=>{
                removeSingleUrlParam("search")
                toast.success(`${toCap(entity_type)} deleted successfully`)
                setOpen(false)
            },
            onError : (e)=> handleAxiosError(e)
        })
    }

    return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger>
            <OptionButton
                variant={"danger"}
                Icon={Trash2}
                label={`Delete ${entity_type}`}
            />
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-md">
            <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 ">
                Delete {entity_type}
            </AlertDialogTitle>

            <AlertDialogDescription className="text-muted-foreground">
                This action cannot be undone. The {entity_type} and all associated data
                will be permanently deleted.
            </AlertDialogDescription>
            </AlertDialogHeader>

        <AlertDialogFooter>
            <Button variant={"ghost"} onClick={()=>setOpen(false)}>
                Cancel
            </Button>

            <Button
                disabled={isPending}
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white"
            >
                {isPending ? "Deleting..." : `Delete ${entity_type}`}
            </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

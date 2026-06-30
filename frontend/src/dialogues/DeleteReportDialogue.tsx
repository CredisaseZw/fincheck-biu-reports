import { OptionButton } from "@/components/general/OptionButton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import useInstanceMutation from "@/hooks/api/useInstanceMutation";
import { handleAxiosError } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface props {
    id: number
}

function DeleteReportAlert({
  id
}: props) {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()
    const {mutate, isPending} = useInstanceMutation()

    const onDelete =()=>{
        mutate({url : `/api/reports/${id}/`, mode: "deletion"}, {
            onSuccess : ()=>{
                queryClient.invalidateQueries({
                    queryKey : ["reports"]
                })
                toast.success("Report deleted successfully")
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
                label="Delete Report"
            />
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-md">
            <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="size-5" />
                Delete Report
            </AlertDialogTitle>

            <AlertDialogDescription className="text-muted-foreground">
                This action cannot be undone. The report and all associated data
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
                {isPending ? "Deleting..." : "Delete Report"}
            </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteReportAlert;
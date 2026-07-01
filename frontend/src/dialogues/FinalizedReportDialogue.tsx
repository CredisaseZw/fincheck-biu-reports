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
import useFinalizeReport from "@/hooks/useFinalizeReport";
import { CheckCheck, CheckCircle2 } from "lucide-react";
interface FinalizedReportDialogProps {
  id: number  
  main?: boolean
}

function FinalizedReportDialog({
  id,
}: FinalizedReportDialogProps) {
    const {
      open,
      isPending,
      onFinalize,
      setOpen,
    } =useFinalizeReport()

    return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <OptionButton 
          Icon={CheckCheck}
          label="Finalize Report"
          variant={"secondary"}/>  
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-green-800 dark:text-green-400">
            <CheckCircle2 className="size-5" />
            Finalize Report
          </AlertDialogTitle>

          <AlertDialogDescription className="text-muted-foreground">
            Once finalized, this report will be locked and marked as complete.
            You may not be able to edit it afterwards.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant={"ghost"} onClick={()=> setOpen(false)}>
            Cancel
          </Button>
                    
            <Button        
              onClick={()=> onFinalize(id)}
              disabled={isPending}
              className="bg-green-800 hover:bg-green-700 focus:ring-green-500 text-white"
            >
              {isPending ? "Finalizing..." : "Confirm Finalize"}
            </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default FinalizedReportDialog;
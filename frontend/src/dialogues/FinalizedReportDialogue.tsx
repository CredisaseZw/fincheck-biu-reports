import LoadingIndicator from "@/components/general/LoadingIndicator";
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
import { FILE_STYLES } from "@/constants";
import useFinalizeReport from "@/hooks/useFinalizeReport";
import { getFileKind } from "@/lib/utils";
import { CheckCheck, CheckCircle2, ExternalLink } from "lucide-react";

interface FinalizedReportDialogProps {
  id: number;
  main?: boolean;
  callback?: ()=> void
}

function FinalizedReportDialog({ id, main = false, callback }: FinalizedReportDialogProps) {
  const { open, isPending, onFinalize, setOpen, url } = useFinalizeReport(callback);
  const kind = getFileKind(url);
  const { icon: FileIcon, classes } = FILE_STYLES[kind];

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        {main ? (
          <Button
            disabled={isPending}
            className={isPending ? "cursor-not-allowed" : ""}
            onClick={() => onFinalize(id)}
          >
            {!isPending ? <CheckCheck /> : <LoadingIndicator variant="button" />}
            Finalize Report
          </Button>
        ) : (
          <OptionButton Icon={CheckCheck} label="Finalize Report" variant={"secondary"} />
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-green-800 dark:text-green-400">
            <CheckCircle2 className="size-5" />
            {url ? "Report Finalized" : "Finalize Report"}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-muted-foreground">
            {url ? (
              "Your report has been finalized. Click below to open it."
            ) : (
              <>
                Once finalized, this report will be locked and marked as complete.
                You may not be able to edit it afterwards.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
       //     onClick={() => callback?.()}
            className={`flex items-center justify-between gap-2 rounded-md border px-4 py-3 text-sm font-medium transition-colors ${classes}`}
          >
            <span className="flex items-center gap-2">
              <FileIcon className="size-4" />
              Open finalized report
            </span>
            <ExternalLink className="size-4" />
          </a>
        )}

        <AlertDialogFooter>
          {url ? (
            <Button variant={"ghost"} onClick={() => setOpen(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button variant={"ghost"} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => onFinalize(id)}
                disabled={isPending}
                className="bg-green-800 hover:bg-green-700 focus:ring-green-500 text-white"
              >
                {isPending ? "Finalizing..." : "Confirm Finalize"}
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default FinalizedReportDialog;
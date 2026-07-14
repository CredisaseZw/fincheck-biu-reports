import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"

interface SubjectMismatchAlertProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onContinue: () => void
}

export function SubjectMismatchAlert({ open, onOpenChange, onContinue }: SubjectMismatchAlertProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle>Subject ID mismatch</AlertDialogTitle>
                    <AlertDialogDescription>
                        Given Subject ID does not match with the subjects. Continue anyway?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onContinue}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
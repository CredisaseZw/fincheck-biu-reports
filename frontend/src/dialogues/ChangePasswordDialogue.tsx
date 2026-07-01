import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingIndicator from "@/components/general/LoadingIndicator";
import useChangePassword from "@/hooks/useChangePassword";
import { cn } from "@/lib/utils";
import { KeyRound } from "lucide-react";

interface ChangePasswordDialogueProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ChangePasswordDialogue({ open, onOpenChange }: ChangePasswordDialogueProps) {
  const {
    onSubmit,
    register,
    handleSubmit,
    errors,
    isPending,
    reset,
  } = useChangePassword(() => {
    onOpenChange(false);
  });

  const handleClose = (value: boolean) => {
    if (!value) reset();
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <div className="form-group">
            <Label className="required">Current Password</Label>
            <Input
              {...register("old_password")}
              type="password"
              placeholder="Enter current password"
            />
            {errors.old_password && (
              <p className="text-red-600 text-xs font-light text-left">{errors.old_password.message}</p>
            )}
          </div>

          <div className="form-group">
            <Label className="required">New Password</Label>
            <Input
              {...register("new_password")}
              type="password"
              placeholder="Enter new password"
            />
            {errors.new_password && (
              <p className="text-red-600 text-xs font-light text-left">{errors.new_password.message}</p>
            )}
          </div>

          <div className="form-group">
            <Label className="required">Confirm New Password</Label>
            <Input
              {...register("confirm_password")}
              type="password"
              placeholder="Confirm new password"
            />
            {errors.confirm_password && (
              <p className="text-red-600 text-xs font-light text-left">{errors.confirm_password.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              type="submit"
              className={cn(
                "min-w-28",
                isPending && "cursor-not-allowed"
              )}
            >
              {isPending
                ? <LoadingIndicator variant="button" />
                : <KeyRound className="size-4" />
              }
              Update Password
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ChangePasswordDialogue;

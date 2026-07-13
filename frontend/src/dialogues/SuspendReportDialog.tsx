"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import CustomDialogueTrigger from "@/components/general/CustomDialogueTrigger";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pause, Play } from "lucide-react";
import { api } from "@/axios/api";

interface props {
    callback?: () => void
    reason?: string | null
    mode: "suspend" | "unsuspend";
    id: number;
}

const suspendSchema = z.object({
  suspension_reason: z.string().optional(),
});

type SuspendFormValues = z.infer<typeof suspendSchema>;

export default function SuspendReportDialog({ mode, id, reason, callback }: props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SuspendFormValues>({
    resolver: zodResolver(suspendSchema),
    defaultValues: { suspension_reason: "" },
  });

  const mutation = useMutation({
    mutationFn: async (payload?: SuspendFormValues) => {
        if (mode === "suspend") {
            return api.patch(`/api/reports/${id}/`, {
                status: "suspended",
                ...(payload?.suspension_reason 
                    && {
                        suspension_reason: payload?.suspension_reason
                    }
                )
            });
        }
        return api.patch(`/api/reports/${id}/`, {
            status: "in_progress",
            suspension_reason: null,
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setOpen(false);
      reset();
      callback?.()
    },
  });

  const onSubmit = (values: SuspendFormValues) => {
    mutation.mutate(values);
  };

  const handleUnsuspend = () => {
    mutation.mutate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CustomDialogueTrigger
        editLabel="Unsuspend Report"
        label={mode === "suspend" ? "Suspend" : "Unsuspend"}
        Icon={mode === "suspend" ? Pause : Play}
        mode={mode === "suspend" ? "create" : "update"}
      />
      <DialogContent className="md:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "suspend" ? "Suspend Report" : "Unsuspend Report"}
          </DialogTitle>
          <DialogDescription>
            {mode === "suspend"
              ? "Provide a reason for suspending this report. It will be moved out of active progress."
              : "This will resume the report and set its status back to In Progress."}
          </DialogDescription>
        </DialogHeader>

        {mode === "suspend" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="suspension_reason">Reason</Label>
                <Textarea
                    id="suspension_reason"
                    placeholder="e.g. Awaiting client documentation"
                    {...register("suspension_reason")}
                />
                {errors.suspension_reason && (
                    <p className="text-sm text-destructive">
                    {errors.suspension_reason.message}
                    </p>
                )}
                </div>
                <DialogFooter>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Suspending..." : "Suspend"}
                </Button>
                </DialogFooter>
            </form>
        ) : (
            <>
                {reason && (
                <div className="space-y-2">
                    <Label>Suspension Reason</Label>
                    <p className="text-sm text-muted-foreground rounded-md border bg-muted/50 p-3">
                    {reason}
                    </p>
                </div>
                )}
                <DialogFooter>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                >
                    Cancel
                </Button>
                <Button onClick={handleUnsuspend} disabled={mutation.isPending}>
                    {mutation.isPending ? "Unsuspending..." : "Unsuspend"}
                </Button>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
import { isAxiosError, type AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const handleAxiosError = (
  error: Error | AxiosError | unknown,
  title = "An error occurred."
) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as {
      error?: string;
      detail?: string;
      message?: string;
    };

    const message =
      data?.error ??
      data?.detail ??
      data?.message ??
      error.message ??
      "Something went wrong";

    toast.error(title, {
      description: message,
    });

    console.log(error)
    return;
  }

  toast.error(title, {
    description: error instanceof Error ? error.message : "Network error.",
  });
};
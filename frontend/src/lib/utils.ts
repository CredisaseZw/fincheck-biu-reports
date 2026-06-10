import { isAxiosError, type AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentDateFormatted() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
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
    return true;
  }
  return false
};



import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "button" | "default";

interface LoadingIndicatorProps {
  variant?: Variant;
  className?: string;
}

export default function LoadingIndicator({ 
  className, 
  variant = "default" 
}: LoadingIndicatorProps) {
  if (variant === "button") {
    return (
      <div
        className="inline-block h-3 w-3 animate-spin rounded-full border-[1.5px] border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 p-4", className)}>
      <Loader2 className="mx-auto animate-spin" />
      <span>Loading...</span>
    </div>
  );
}
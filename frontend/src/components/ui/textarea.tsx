import * as React from "react"
import { cn } from "@/lib/utils"

interface TextareaProps extends React.ComponentProps<"textarea"> {
  rounded?: boolean
  bg?: "transparent" | "fill"
}

function Textarea({ className, rounded = true, bg = "fill", ...props }: TextareaProps) {
  const edges = rounded ? "rounded-md" : "rounded-none"

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "bg-light dark:bg-zinc-950/50",
        "flex w-full",
        "text-foreground placeholder:text-muted-foreground",
        "transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // identical to Input default variant
        "border border-input-border",
        "p-3 text-base md:text-sm",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring focus:ring-offset-background",
        // textarea-specific
        "min-h-[80px] resize-none field-sizing-content",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30",
        bg === "transparent" && "bg-transparent",
        edges,
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
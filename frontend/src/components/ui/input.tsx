import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  rounded?: true | false
  variant?: "default" | "sm" | "ghost"
  bg?: "transparent" | "fill"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", bg = "fill", rounded = true, ...props }, ref) => {
    const edges = rounded ? "rounded-md" : "rounded-none";
    const base = cn(
      "bg-light dark:bg-zinc-950/50",
      "text-gray-600 dark:text-gray-50",
      "flex w-full text-gray-800 placeholder:text-gray-400 ",
      "transition-all duration-200",
      "disabled:cursor-not-allowed disabled:opacity-50",
      bg === "fill" ? "bg-white" : "bg-transparent"
    )

    const variants = {
      default: cn(
        "border border-input-border p-3  text-base md:text-sm",
        "focus:outline-none bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-[#3C7C9B] "
      ),
      sm: cn(
        "border border-input-border px-2 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      ),
      ghost: "border-none bg-transparent p-0 shadow-none focus:outline-none focus:ring-0",
    }

    return (
      <input
        onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
        ref={ref}
        type={type}
        className={cn(base, variants[variant], edges, className)}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
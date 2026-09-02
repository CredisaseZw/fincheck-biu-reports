import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeClosed } from "lucide-react";

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

    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === "password"
    const controlledType = isPassword ? (showPassword ? "text" : "password") : type

    return (
      <div className="relative flex w-full">
        <input
          onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
          ref={ref}
          type={controlledType}
          className={cn(base, variants[variant], edges, isPassword && "pr-10", className)}
          {...props}
        />
        {isPassword && (
         <button
          onClick={() => setShowPassword((s) => !s)}
          type="button"
          tabIndex={-1}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800"
        >
          {showPassword ? (
            <Eye className="h-4 w-4 shrink-0 text-gray-700 dark:text-gray-100" />
          ) : (
            <EyeClosed className="h-4 w-4 shrink-0 text-gray-700 dark:text-gray-100" />
          )}
        </button>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
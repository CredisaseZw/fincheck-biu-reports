import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

type Variant = "success" | "danger" | "warning" | "outline" | "ghost"

interface StatusPillProps {
  children: ReactNode
  variant?: Variant
  icon?: LucideIcon
  className?: string
}

const variantStyles: Record<Variant, string> = {
  success:
    "bg-green-100 text-green-800 border border-green-200 dark:bg-green-800/30 ",
  danger:
    "bg-red-100 text-red-700 border border-red-200 dark:bg-red-800/30 dark:text-red-400",
  warning:
    "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-800/30 dark:text-yellow-400",
  outline:
    "bg-transparent border border-muted-foreground/30 text-foreground dark:bg-transparent dark:border-muted-foreground/30 dark:text-foreground",
  ghost:
    "bg-muted text-foreground border border-transparent dark:bg-muted/30 dark:text-foreground",
}

export function StatusPill({
  children,
  variant = "success",
  icon,
  className,
}: StatusPillProps) {
  const Icon = icon;
  return (
    <span
      className={cn(
        "inline-flex items-center w-fit gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        variantStyles[variant],
        className
      )}
    >
      {Icon && (
        <Icon size={15} className="flex items-center justify-center text-sm"/>
      )}
      {children}
    </span>
  )
}

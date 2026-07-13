import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "success" | "danger" | "warning" | "black" | "outline" | "ghost";

interface StatusPillProps {
  children: ReactNode;
  variant?: Variant;
  icon?: LucideIcon;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  success:
    "bg-green-100 text-green-800 border border-green-200 " +
    "dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30",

  danger:
    "bg-red-100 text-red-700 border border-red-200 " +
    "dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30",

  warning:
    "bg-yellow-100 text-yellow-800 border border-yellow-200 " +
    "dark:bg-yellow-500/10 dark:text-yellow-300 dark:border-yellow-500/30",

  black:
    "bg-black text-white border border-black/20 " +
    "dark:bg-black dark:text-white",

  outline:
    "bg-transparent border border-muted-foreground/30 text-foreground " +
    "dark:border-muted-foreground/40 dark:text-muted-foreground",

  ghost:
    "bg-muted text-foreground border border-transparent " +
    "dark:bg-white/5 dark:text-muted-foreground",
};

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
        "inline-flex items-center w-fit gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap backdrop-blur-[2px]",
        variantStyles[variant],
        className
      )}
    >
      {Icon && <Icon size={14} className="shrink-0" />}
      {children}
    </span>
  );
}
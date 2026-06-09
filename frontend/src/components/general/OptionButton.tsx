import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";

export interface ButtonProps{
    Icon?: LucideIcon,
    label: string
}
export function OptionButton({Icon, label }: ButtonProps) {  return (
    <Button
      type="button"
      className={cn(
        "inline-flex items-center justify-center px-3 py-4",
        "text-sm font-normal tracking-wide text-center transition-all duration-200 cursor-pointer select-none",
        "rounded border border-transparent",
        "bg-gray-50 text-gray-900 hover:bg-gray-200/80 active:scale-[0.98]",        
        "dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-zinc-800/50",
        "dark:hover:bg-zinc-900 dark:hover:text-white dark:hover:border-zinc-700/60",        
        "outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
    >   
        {Icon && <Icon/>}
        {label}
    </Button>
)
}

export default OptionButton
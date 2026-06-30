import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";

const optionButtonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-md border text-xs font-medium",
    "transition-all duration-200",
    "cursor-pointer select-none",
    "active:scale-[0.98]",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring/70",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-gray-100 text-gray-900 border-transparent",
          "hover:bg-gray-200",
          "dark:bg-[#1A2330]",
          "dark:text-slate-200",
          "dark:border-slate-800/70",
          "dark:hover:bg-[#232D3D]",
          "dark:hover:border-slate-700",
          "dark:hover:text-white",
        ],

        secondary: [
          "bg-transparent border-slate-200 text-slate-700",
          "hover:bg-slate-100",
          "dark:border-slate-700",
          "dark:text-slate-300",
          "dark:hover:bg-slate-800/60",
        ],

        outline: [
          "bg-transparent border-slate-300",
          "hover:bg-slate-100",
          "dark:border-slate-600",
          "dark:text-slate-200",
          "dark:hover:bg-slate-800",
        ],

        ghost: [
          "bg-transparent border-transparent text-slate-700",
          "hover:bg-slate-100",
          "dark:hover:bg-slate-800/70",
          "dark:text-slate-300",
          "dark:hover:text-white",
        ],

        active: [
          "bg-blue-600 text-white border-blue-600",
          "hover:bg-blue-700",
          "dark:bg-blue-600",
          "dark:border-blue-500",
          "shadow-sm",
        ],

        danger: [
          "bg-red-200 text-red-500 border-red-500 dark:bg-red-800/20",
          "hover:bg-red-100 dark:hover:bg-red-800/10",
          "shadow-sm",
        ],
      },

      size: {
        sm: "h-8 px-3",
        md: "h-9 px-4",
        lg: "h-10 px-5 text-sm",
      },

      fullWidth: {
        true: "w-full",
        false: "w-fit",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "sm",
      fullWidth: true,
    },
  }
);

interface OptionButtonProps
  extends VariantProps<typeof optionButtonVariants>{
  Icon?: LucideIcon;
  label: string;
  className?: string;
}
export function OptionButton({
  Icon,
  label,
  variant,
  size,
  fullWidth,
  className,
}: OptionButtonProps) {
  return (
    <Button
      type="button"
      size={"sm"}
      className={cn(
        optionButtonVariants({
          variant,
          size,
          fullWidth,
        }),
        className
      )}
    >
      {Icon && <Icon className="size-4 shrink-0" />}
      <span>{label}</span>
    </Button>
  );
}

export default OptionButton;
import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default" | "lg"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border-2 transition-all outline-none cursor-pointer",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",

        "data-[size=sm]:h-4 data-[size=sm]:w-7",
        "data-[size=default]:h-6 data-[size=default]:w-12",
        "data-[size=lg]:h-8 data-[size=lg]:w-[60px]",

        "data-checked:bg-primary data-checked:border-primary",
        "data-unchecked:bg-gray-300 dark:data-unchecked:bg-zinc-950/50 data-unchecked:border-transparent",

        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow transition-transform",

          // Thumb sizes
          "group-data-[size=sm]/switch:h-3 group-data-[size=sm]/switch:w-3",
          "group-data-[size=default]/switch:h-5 group-data-[size=default]/switch:w-5",
          "group-data-[size=lg]/switch:h-7 group-data-[size=lg]/switch:w-7",

          // Movement
          "data-unchecked:translate-x-0.5",
          "group-data-[size=sm]/switch:data-checked:translate-x-3",
          "group-data-[size=default]/switch:data-checked:translate-x-6",
          "group-data-[size=lg]/switch:data-checked:translate-x-7"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
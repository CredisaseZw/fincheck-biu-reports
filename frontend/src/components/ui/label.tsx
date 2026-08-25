import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

interface props extends React.ComponentProps<typeof LabelPrimitive.Root>{
  highlighted?: boolean
}

function Label({
  className,
  highlighted = true,
  ...props
}: props) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        !highlighted
        ? "text-gray-900 dark:text-gray-200"
        : "text-orange-700 dark:text-orange-400",
        className,
      )}
      {...props}
    />
  )
}

export { Label }

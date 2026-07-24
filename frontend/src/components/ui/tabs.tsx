import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-4 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  [
    "group/tabs-list inline-flex w-fit items-center",
    "rounded-xl border border-border/60",
    "bg-muted/50 p-1",
    "text-muted-foreground",
    "shadow-sm",
    "backdrop-blur-sm",
    "transition-colors",

    // Vertical tabs
    "group-data-vertical/tabs:flex-col",
    "group-data-vertical/tabs:items-stretch",
    "group-data-vertical/tabs:rounded-2xl",
    "group-data-vertical/tabs:p-1.5",

    // Line variant
    "data-[variant=line]:rounded-none",
    "data-[variant=line]:border-0",
    "data-[variant=line]:bg-transparent",
    "data-[variant=line]:p-0",
    "data-[variant=line]:shadow-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "gap-1",
        line: "gap-5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        [
          "relative inline-flex h-9 items-center justify-center",
          "gap-2 whitespace-nowrap rounded-lg",
          "border border-transparent",
          "px-3.5 py-1.5",
          "text-sm font-medium",
          "text-muted-foreground",
          "transition-all duration-200 ease-out",

          "hover:text-foreground",

          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-ring/50",

          // Disabled
          "disabled:pointer-events-none",
          "disabled:opacity-50",

          // Active state
          "data-active:bg-primary",
          "data-active:text-gray-200",
          "data-active:shadow-sm",
          "data-active:border-border/70",

          // Dark mode,
          "dark:data-active:border-border",

          // Vertical
          "group-data-vertical/tabs:w-full",
          "group-data-vertical/tabs:justify-start",
          "group-data-vertical/tabs:rounded-xl",

          // Line variant
          "group-data-[variant=line]/tabs-list:rounded-none",
          "group-data-[variant=line]/tabs-list:border-transparent",
          "group-data-[variant=line]/tabs-list:bg-transparent",
          "group-data-[variant=line]/tabs-list:shadow-none",

          "group-data-[variant=line]/tabs-list:data-active:bg-transparent",
          "group-data-[variant=line]/tabs-list:data-active:border-transparent",
          "group-data-[variant=line]/tabs-list:data-active:shadow-none",

          // Modern active indicator
          "after:absolute",
          "after:-bottom-1.5",
          "after:left-1/2",
          "after:h-0.5",
          "after:w-0",
          "after:-translate-x-1/2",
          "after:rounded-full",
          "after:bg-primary",
          "after:opacity-0",
          "after:transition-all",
          "after:duration-200",

          "group-data-[variant=line]/tabs-list:data-active:after:w-full",
          "group-data-[variant=line]/tabs-list:data-active:after:opacity-100",

          // Icons
          "[&_svg]:pointer-events-none",
          "[&_svg]:shrink-0",
          "[&_svg:not([class*='size-'])]:size-4",
        ].join(" "),
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 text-sm outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring/50",
        "focus-visible:rounded-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
}
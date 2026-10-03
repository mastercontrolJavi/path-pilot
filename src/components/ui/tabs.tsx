"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-4 data-horizontal:flex-col", className)}
      {...props}
    />
  )
}

/**
 * `line` (default): text tabs over a contour hairline, active tab marked in forest.
 * `track`: compact segmented control on a fog track.
 */
const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit items-center text-ink-muted group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        line: "w-full gap-6 border-b border-contour group-data-vertical/tabs:gap-1 group-data-vertical/tabs:border-b-0 group-data-vertical/tabs:border-l",
        track: "gap-1 rounded-control bg-fog p-1",
        // Alias for older call sites.
        default: "gap-1 rounded-control bg-fog p-1",
      },
    },
    defaultVariants: {
      variant: "line",
    },
  }
)

function TabsList({
  className,
  variant = "line",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-[180ms] hover:text-ink disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:text-ink [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // line
        "group-data-[variant=line]/tabs-list:h-11 group-data-[variant=line]/tabs-list:px-0.5",
        "after:absolute after:bg-forest after:opacity-0 after:transition-opacity after:duration-[180ms] group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        "group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5",
        "group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:pl-4 group-data-vertical/tabs:after:inset-y-1 group-data-vertical/tabs:after:-left-px group-data-vertical/tabs:after:w-0.5",
        // track (and default alias)
        "group-data-[variant=default]/tabs-list:h-8 group-data-[variant=default]/tabs-list:rounded-[6px] group-data-[variant=default]/tabs-list:px-3 group-data-[variant=default]/tabs-list:data-active:bg-sheet group-data-[variant=default]/tabs-list:data-active:shadow-[0_1px_2px_rgb(23_33_28/0.08)]",
        "group-data-[variant=track]/tabs-list:h-8 group-data-[variant=track]/tabs-list:rounded-[6px] group-data-[variant=track]/tabs-list:px-3 group-data-[variant=track]/tabs-list:data-active:bg-sheet group-data-[variant=track]/tabs-list:data-active:shadow-[0_1px_2px_rgb(23_33_28/0.08)]",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }

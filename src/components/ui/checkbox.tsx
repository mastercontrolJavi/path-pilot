"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-input bg-sheet transition-colors duration-[180ms] after:absolute after:-inset-3 hover:border-ink-muted disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger data-checked:border-forest data-checked:bg-forest data-checked:text-sheet",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current [&>svg]:size-3.5"
      >
        <CheckIcon strokeWidth={2.25} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

/**
 * Full-width multi-select answer row. The whole row is the checkbox; checked
 * rows show a filled box and a forest left edge. Pass `hint` for a shortcut chip.
 */
function CheckboxRow({
  className,
  children,
  hint,
  ...props
}: CheckboxPrimitive.Root.Props & { hint?: React.ReactNode }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox-row"
      nativeButton
      render={<button type="button" />}
      className={cn(
        "group/checkbox-row relative flex min-h-14 w-full cursor-pointer items-center gap-4 rounded-control border border-contour bg-sheet py-3 pr-4 pl-5 text-left text-base text-ink transition-[background-color,border-color] duration-[180ms] [--focus-offset:-2px] before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-control before:bg-transparent before:transition-colors hover:border-edge hover:bg-fog disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-forest/50 data-checked:before:bg-forest",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className="grid size-[18px] shrink-0 place-items-center rounded-[5px] border border-input bg-sheet text-sheet transition-colors group-data-checked/checkbox-row:border-forest group-data-checked/checkbox-row:bg-forest"
      >
        <CheckIcon className="size-3.5 opacity-0 group-data-checked/checkbox-row:opacity-100" strokeWidth={2.25} />
      </span>
      <span className="flex-1">{children}</span>
      {hint}
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, CheckboxRow }

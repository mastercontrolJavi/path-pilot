"use client"

import * as React from "react"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-[18px] shrink-0 cursor-pointer rounded-full border border-input bg-sheet transition-colors duration-[180ms] after:absolute after:-inset-3 hover:border-ink-muted disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger data-checked:border-forest",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-full items-center justify-center"
      >
        <span className="size-2 rounded-full bg-forest" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

/**
 * Full-width answer row (wizard single-choice). The whole row is the radio:
 * selected rows confirm with a check and a forest left edge.
 * Pass `hint` (e.g. a <KeyHint>) to show a desktop shortcut.
 */
function RadioGroupRow({
  className,
  children,
  hint,
  ...props
}: RadioPrimitive.Root.Props & { hint?: React.ReactNode }) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-row"
      nativeButton
      render={<button type="button" />}
      className={cn(
        "group/radio-row relative flex min-h-14 w-full cursor-pointer items-center gap-4 rounded-control border border-contour bg-sheet py-3 pr-4 pl-5 text-left text-base text-ink transition-[background-color,border-color] duration-[180ms] [--focus-offset:-2px] before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-control before:bg-transparent before:transition-colors hover:border-edge hover:bg-fog disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-forest/50 data-checked:bg-sheet data-checked:before:bg-forest",
        className
      )}
      {...props}
    >
      <span className="flex-1">{children}</span>
      <span
        aria-hidden
        className="grid size-6 shrink-0 place-items-center rounded-full text-forest opacity-0 transition-opacity duration-[120ms] group-data-checked/radio-row:opacity-100"
      >
        <CheckIcon className="size-[18px]" strokeWidth={2} />
      </span>
      {hint}
    </RadioPrimitive.Root>
  )
}

/** Compact pill choice (e.g. picking a destination). Arrow keys move between pills. */
function RadioGroupChip({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-chip"
      nativeButton
      render={<button type="button" />}
      className={cn(
        "inline-flex min-h-9 cursor-pointer items-center rounded-full border border-contour bg-sheet px-3.5 py-1.5 text-left text-sm text-ink transition-colors duration-[180ms] hover:border-edge hover:bg-fog disabled:cursor-not-allowed disabled:opacity-50 pointer-coarse:min-h-11 data-checked:border-forest data-checked:bg-forest data-checked:text-sheet",
        className
      )}
      {...props}
    />
  )
}

export { RadioGroup, RadioGroupItem, RadioGroupRow, RadioGroupChip }

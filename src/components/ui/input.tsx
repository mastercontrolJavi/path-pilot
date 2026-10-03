import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/** Shared control surface for Input and Textarea. */
const fieldClass =
  "w-full min-w-0 rounded-control border border-input bg-sheet px-3 text-base text-ink transition-colors duration-[180ms] placeholder:text-ink-faint hover:border-ink-muted focus-visible:border-forest disabled:cursor-not-allowed disabled:bg-fog disabled:opacity-60 aria-invalid:border-danger aria-invalid:hover:border-danger"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        fieldClass,
        "h-11 py-2 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink",
        className
      )}
      {...props}
    />
  )
}

export { Input, fieldClass }

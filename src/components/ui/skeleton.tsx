import { cn } from "@/lib/utils"

/** Placeholder block. Compose skeletons to match the real layout's shape. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-control bg-fog", className)}
      {...props}
    />
  )
}

export { Skeleton }

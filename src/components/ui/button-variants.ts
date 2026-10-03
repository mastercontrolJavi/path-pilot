import { cva, type VariantProps } from "class-variance-authority"

/**
 * Button — primary (forest, one per view), secondary (hairline), quiet (text-only).
 * `default` / `outline` / `ghost` remain as aliases for older call sites.
 */
const primary =
  "bg-primary text-primary-foreground hover:bg-forest-deep aria-expanded:bg-forest-deep"
const secondary =
  "border-contour bg-sheet text-ink hover:border-edge hover:bg-fog aria-expanded:bg-fog"
const quiet =
  "text-ink-muted hover:bg-fog hover:text-ink aria-expanded:bg-fog aria-expanded:text-ink"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control border border-transparent bg-clip-padding font-medium whitespace-nowrap select-none [transition:background-color_180ms,color_180ms,border-color_180ms,transform_120ms] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px] [&_svg]:stroke-[1.5]",
  {
    variants: {
      variant: {
        primary,
        secondary,
        quiet,
        destructive:
          "border-danger/40 bg-sheet text-danger hover:border-danger hover:bg-danger/5",
        link: "h-auto! px-0! text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-forest active:scale-100",
        // Aliases kept so existing call sites keep working.
        default: primary,
        outline: secondary,
        ghost: quiet,
      },
      size: {
        default:
          "h-10 gap-2 px-4 text-sm pointer-coarse:min-h-11 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        sm: "h-9 gap-1.5 px-3 text-sm pointer-coarse:min-h-11 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 gap-2 px-5 text-base pointer-coarse:min-h-12",
        xs: "h-8 gap-1 px-2.5 text-xs pointer-coarse:min-h-11 [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-10 pointer-coarse:size-11",
        "icon-sm": "size-9 pointer-coarse:size-11 [&_svg:not([class*='size-'])]:size-4",
        "icon-xs": "size-8 pointer-coarse:size-11 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

export { buttonVariants }

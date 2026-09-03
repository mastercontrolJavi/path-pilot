import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * The site's headline call to action.
 *
 * At rest it shows a single waypoint dot; on hover that dot expands to flood
 * the button while the label slides out and a second label arrives with an
 * arrow — the same "advance to the next point on the route" gesture the
 * constellation and the timeline use. Motion lives in `globals.css` under the
 * `.cta-*` classes so `prefers-reduced-motion` can switch it off in one place.
 */
const ctaButtonVariants = cva(
  "cta group/cta relative isolate inline-flex h-12 shrink-0 select-none items-center justify-center overflow-hidden rounded-full px-7 text-sm font-medium",
  {
    variants: {
      variant: {
        /** Primary action on the paper background: green fills to cream. */
        solid: "cta-solid bg-primary text-primary-foreground",
        /** Secondary action on the paper background: cream fills to green. */
        outline: "cta-outline border bg-transparent text-foreground",
        /** Primary action on the deep green band: cream fills to ink. */
        inverse: "cta-inverse bg-[#faf7f2] text-primary",
      },
    },
    defaultVariants: { variant: "solid" },
  },
);

type CtaButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
} & VariantProps<typeof ctaButtonVariants>;

export function CtaButton({
  href,
  children,
  variant,
  className,
}: CtaButtonProps) {
  return (
    <Link
      href={href}
      className={cn(ctaButtonVariants({ variant }), className)}
    >
      <span className="cta-flood" aria-hidden="true" />
      <span className="cta-label">{children}</span>
      <span className="cta-label-hover" aria-hidden="true">
        {children}
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}

export { ctaButtonVariants };

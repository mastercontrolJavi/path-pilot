import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { ContourField } from "@/components/pp/contour-field";
import { sampleProfile } from "@/lib/fixtures/sample-report";
import { HeroRoute } from "./hero-route";
import { DrawWhenVisible } from "./draw-when-visible";

export function Hero({ ctaHref }: { ctaHref: string }) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      {/* Contour lines sit behind the route side and fade out behind the headline. */}
      <ContourField
        seed={11}
        className="absolute inset-0 -z-10 size-full [mask-image:linear-gradient(to_right,transparent_20%,black_65%)]"
      />
      <div className="mx-auto max-w-page px-4 pt-12 pb-20 sm:px-6 md:pt-20 md:pb-32">
        <h1
          id="hero-title"
          className="font-display text-hero font-[400] text-balance text-ink sm:text-pretty"
        >
          <span className="sm:block">You know you want out.</span>{" "}
          <span className="sm:block">Here&apos;s where you can go.</span>
        </h1>

        <div className="mt-10 grid gap-14 md:mt-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p className="max-w-[52ch] text-lg text-ink-muted">
              Upload your CV. PathPilot maps the roles your experience already fits, what they typically pay,
              the skills between you and them, and a seven-day plan to get moving.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={ctaHref}
                className={buttonVariants({ size: "lg" })}
                data-track="landing_cta_clicked"
                data-track-location="hero"
              >
                Map my next move
              </Link>
              <a href="#sample" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                See a sample report
              </a>
            </div>
            {/* COPY-CHECK: true while PathPilot has no pricing. */}
            <p className="mt-4 text-sm text-ink-faint">Free to use. No credit card.</p>
          </div>

          <figure className="w-full max-w-[520px] lg:col-span-6 lg:col-start-7 lg:justify-self-end">
            <DrawWhenVisible>
              <HeroRoute />
            </DrawWhenVisible>
            <figcaption className="mt-6 text-xs text-ink-faint">
              Sample route for an {sampleProfile.role.toLowerCase()}. Pay figures are estimates.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

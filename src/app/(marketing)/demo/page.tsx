import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/user";
import { buttonVariants } from "@/components/ui/button-variants";
import { SampleReport } from "@/components/report/sample-report";
import { sampleProfile } from "@/lib/fixtures/sample-report";

export const metadata: Metadata = {
  title: "Sample report - PathPilot",
  description: "See what a PathPilot report looks like before you sign up.",
};

export default async function DemoPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-page px-4 pt-12 pb-24 sm:px-6 md:pt-20">
      <header className="max-w-[44rem]">
        <p className="text-sm text-ink-muted">Sample report</p>
        <h1 className="mt-2 font-display text-2xl font-[400] tracking-[-0.015em] text-ink md:text-3xl">
          {`Where an ${sampleProfile.role.toLowerCase()} with ${sampleProfile.years} years' experience can go`}
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          The person isn&apos;t real, and pay figures are estimates. Everything else works the way your report
          will.
        </p>
      </header>

      <div className="mt-12">
        <h2 className="sr-only">The report</h2>
        <SampleReport />
      </div>

      <div className="mt-20 border-t border-contour pt-12">
        <p className="max-w-[18ch] font-display text-2xl font-[400] tracking-[-0.015em] text-ink md:text-3xl">
          Find out where your experience can take you.
        </p>
        <Link
          href={user ? "/new" : "/signup"}
          className={`${buttonVariants({ size: "lg" })} mt-8`}
          data-track="landing_cta_clicked"
          data-track-location="final"
        >
          Map my next move
        </Link>
      </div>
    </div>
  );
}

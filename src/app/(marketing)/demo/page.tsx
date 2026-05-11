import Link from "next/link";
import { demoAnalysis } from "@/lib/demo-data";
import { SummaryHeader } from "@/components/analysis/summary-header";
import { StrengthsSection } from "@/components/analysis/strengths-section";
import { CareerPathsSection } from "@/components/analysis/career-paths-section";
import { AvoidRolesSection } from "@/components/analysis/avoid-roles-section";
import { ActionPlanSection } from "@/components/analysis/action-plan-section";
import { CvRewritesSection } from "@/components/analysis/cv-rewrites-section";
import { ConfidenceNote } from "@/components/analysis/confidence-note";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Sample Analysis - PathPilot",
  description:
    "See what a PathPilot career analysis looks like before signing up.",
};

export default function DemoPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Top banner */}
      <div className="sticky top-[64px] z-40 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3.5 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-900 font-medium">
            This is a sample analysis. Create a free account to analyse your
            own CV.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-900 hover:text-amber-700 whitespace-nowrap transition-colors"
          >
            Get started →
          </Link>
        </div>
      </div>

      {/* Demo label */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-medium text-muted-foreground px-2.5 py-1 rounded-md bg-accent border border-border/50">
          Sample analysis - Maya Chen, Marketing Graduate
        </span>
      </div>

      <div className="space-y-8">
        <SummaryHeader summary={demoAnalysis.summary} />
        <StrengthsSection strengths={demoAnalysis.strengths} />
        <CareerPathsSection paths={demoAnalysis.career_paths} />
        <AvoidRolesSection roles={demoAnalysis.avoid_roles} />
        <ActionPlanSection steps={demoAnalysis.action_plan} />
        <CvRewritesSection rewrites={demoAnalysis.cv_rewrites} />
        <ConfidenceNote note={demoAnalysis.confidence_note} />
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 py-12 px-6 rounded-2xl bg-[#0F0F0F] text-white text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Ready to get your own analysis?
        </h2>
        <p className="text-white/50 mb-8">
          It takes 10 minutes. No credit card required.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0F0F0F] font-medium text-base hover:bg-white/90 transition-colors shadow-sm"
        >
          Get started free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

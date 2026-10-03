import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/supabase/user";
import { Hero } from "@/components/landing/hero";
import {
  Audience,
  FaqSection,
  FinalCta,
  HowItWorks,
  PrivacySummary,
  SampleSection,
  TabsVsRoute,
} from "@/components/landing/sections";

export const metadata: Metadata = {
  title: "PathPilot - Map your next career move",
  description:
    "Upload your CV and see the roles your experience already fits, what they typically pay, the skills between you and them, and a seven-day plan to get moving.",
};

export default async function LandingPage() {
  const user = await getCurrentUser();
  const ctaHref = user ? "/new" : "/signup";

  return (
    <>
      <Hero ctaHref={ctaHref} />
      <TabsVsRoute />
      <HowItWorks />
      <SampleSection />
      <Audience />
      <PrivacySummary />
      <FaqSection />
      <FinalCta ctaHref={ctaHref} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MotionRoot } from "@/components/pp/motion-root";

export const metadata: Metadata = {
  title: "Design system - PathPilot",
  robots: { index: false, follow: false },
};

/** Internal review surface. Available locally and on preview deployments only. */
export default function DesignLayout({ children }: { children: React.ReactNode }) {
  if (process.env.VERCEL_ENV === "production") notFound();
  return (
    <MotionRoot>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster position="bottom-right" />
    </MotionRoot>
  );
}

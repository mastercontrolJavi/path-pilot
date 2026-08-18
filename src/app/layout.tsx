import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = { title: "PathPilot — Find the work that fits", description: "A thoughtful CV analysis and a clear, seven-day route forward." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="antialiased"><body className="min-h-screen flex flex-col">{children}<Toaster position="bottom-right" /><Analytics /></body></html>;
}

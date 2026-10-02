import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { fraunces, fragmentMono, generalSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "PathPilot - Find your career path",
  description:
    "Stop guessing what to apply for. Upload your CV, answer a few questions, and get 3 realistic career paths plus a 7-day action plan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${fragmentMono.variable} ${generalSans.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

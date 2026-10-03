import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { fraunces, fragmentMono, generalSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "PathPilot - Map your next career move",
  description:
    "Upload your CV and see the roles your experience already fits, what they typically pay, the skills between you and them, and a seven-day plan to get moving.",
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

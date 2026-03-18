import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PathPilot — Find your career path",
  description:
    "Stop guessing what to apply for. Upload your CV, answer a few questions, and get 3 realistic career paths plus a 7-day action plan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#FAFAFA] text-foreground">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

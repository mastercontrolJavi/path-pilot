import Link from "next/link";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-4">
      <Link
        href="/"
        className="text-2xl font-semibold tracking-tight mb-8"
      >
        PathPilot
      </Link>
      <div className="w-full max-w-md">
        <Suspense>{children}</Suspense>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

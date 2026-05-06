import Link from "next/link";
import { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] px-4">
      <Link
        href="/"
        className="text-2xl font-semibold tracking-tight mb-8"
      >
        PathPilot
      </Link>
      <div className="w-full max-w-md">
        <Suspense>{children}</Suspense>
      </div>
    </div>
  );
}

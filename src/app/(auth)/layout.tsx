import Link from "next/link";
import { Suspense } from "react";
import { PathPilotLogo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf7f2] px-4 py-12">
      <Link
        href="/"
        className="mb-12"
      >
        <PathPilotLogo className="text-primary" />
      </Link>
      <div className="w-full max-w-md">
        <Suspense>{children}</Suspense>
      </div>
    </div>
  );
}

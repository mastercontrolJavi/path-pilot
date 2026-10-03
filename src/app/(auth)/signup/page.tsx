import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create your account - PathPilot" };

export default function SignupPage() {
  return <SignupForm />;
}

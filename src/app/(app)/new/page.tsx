import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/supabase/user";
import { NewRoute } from "@/components/wizard/new-route";

export const metadata: Metadata = { title: "New route - PathPilot" };

export default async function NewPage() {
  // The (app) layout has already redirected signed-out visitors to /login.
  const user = await getCurrentUser();
  return <NewRoute userId={user!.id} />;
}

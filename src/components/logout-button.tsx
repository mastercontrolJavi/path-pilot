"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      aria-label="Sign out"
      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-accent transition-colors"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDataDialog } from "./delete-data-dialog";

const AVATAR_CLASS =
  "grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-contour bg-moss/50 text-sm font-medium text-ink transition-colors hover:bg-moss/70 pointer-coarse:size-11";

/** The avatar's menu: who you're signed in as, delete my data, sign out. Loaded after first paint. */
export default function AccountMenu({ name, email, initials }: { name: string; email: string; initials: string }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label={`Account menu for ${name}`} className={AVATAR_CLASS}>
          {initials}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            <p className="truncate text-xs text-ink-muted">{email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteOpen(true)}>Delete my data</DropdownMenuItem>
          <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteDataDialog open={deleteOpen} onOpenChange={setDeleteOpen} email={email} />
    </>
  );
}

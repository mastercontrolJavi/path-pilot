"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { CONTACT_EMAIL } from "@/config/site";

/**
 * Deletion works exactly as the Privacy Policy says today: by email request,
 * completed within 30 days. This dialog states what gets deleted, opens that
 * email ready to send, and can clear what this browser holds right away.
 */
export function DeleteDataDialog({
  open,
  onOpenChange,
  email,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}) {
  const [cleared, setCleared] = useState(false);
  // Start on Cancel: Enter on open should never clear or send anything.
  const cancelRef = useRef<HTMLButtonElement>(null);

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Delete my PathPilot data")}&body=${encodeURIComponent(
    `Please delete my PathPilot account and all of its data.\n\nAccount email: ${email}`
  )}`;

  function clearBrowser() {
    try {
      for (const key of Object.keys(window.localStorage)) if (key.startsWith("pp:")) window.localStorage.removeItem(key);
    } catch {
      // Storage blocked: nothing was kept here.
    }
    setCleared(true);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent initialFocus={cancelRef}>
        <DialogHeader>
          <DialogTitle>Delete your data</DialogTitle>
          <DialogDescription>
            We permanently delete your account, the CVs you uploaded, your answers and every report within 30 days of
            your request. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-ink-muted">
          Requests are handled by email for now. Send it from <span className="break-all text-ink">{email}</span>
          {" so we can confirm it's you."}
        </p>
        <div className="border-t border-contour pt-4 text-sm text-ink-muted">
          <p>Answers in progress and plan check marks are also saved in this browser.</p>
          {cleared ? (
            <p aria-live="polite" className="mt-2 text-success">
              Cleared from this browser.
            </p>
          ) : (
            <button
              type="button"
              onClick={clearBrowser}
              className="mt-2 cursor-pointer rounded-control text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-forest"
            >
              Clear them from this browser now
            </button>
          )}
        </div>
        <DialogFooter>
          <DialogClose ref={cancelRef} render={<Button variant="quiet" />}>
            Cancel
          </DialogClose>
          <a href={mailto} className={buttonVariants({ variant: "destructive" })}>
            Email a deletion request
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

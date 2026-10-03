"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AUTH_ERROR_COPY, classifyAuthError, webmailFor } from "@/lib/auth-errors";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import { formatCountdown, useCooldown } from "./use-cooldown";

const COOLDOWN_S = 30;

/** Shown after sign-up when Supabase asks the user to confirm their email. */
export function CheckEmail({
  email,
  emailRedirectTo,
  onUseDifferentEmail,
}: {
  email: string;
  emailRedirectTo: string;
  onUseDifferentEmail: () => void;
}) {
  // The first email just went out, so the cooldown starts straight away.
  const { left, start } = useCooldown(COOLDOWN_S);
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [sending, setSending] = useState(false);
  const webmail = webmailFor(email);

  async function resend() {
    setSending(true);
    setStatus(null);
    try {
      const { error } = await createClient().auth.resend({ type: "signup", email, options: { emailRedirectTo } });
      if (error) {
        setStatus({ tone: "error", text: AUTH_ERROR_COPY[classifyAuthError(error)] });
      } else {
        setStatus({ tone: "ok", text: "Sent again. It can take a minute to arrive." });
        start(COOLDOWN_S);
      }
    } catch (error) {
      setStatus({ tone: "error", text: AUTH_ERROR_COPY[classifyAuthError(error)] });
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-[400] tracking-[-0.01em] text-ink">Check your email</h1>
      <p className="mt-3 text-base text-ink-muted">
        We sent a confirmation link to <span className="font-mono break-all text-ink">{email}</span>. Open it to
        finish creating your account.
      </p>

      <div className="mt-8">
        {webmail ? (
          <a
            href={webmail.href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            {webmail.label}
          </a>
        ) : (
          <p className="text-base text-ink">Open your email app and look for the confirmation email.</p>
        )}
      </div>

      <div className="mt-10 border-t border-contour pt-6 text-sm text-ink-muted">
        <p>Nothing yet? It can take a minute, and it sometimes lands in spam.</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button variant="secondary" size="sm" onClick={resend} disabled={left > 0 || sending} aria-busy={sending}>
            {sending ? "Sending" : "Resend the email"}
          </Button>
          {left > 0 && (
            <span>
              Available in <span className="font-mono text-ink">{formatCountdown(left)}</span>
            </span>
          )}
        </div>
        <p aria-live="polite" className={status?.tone === "error" ? "mt-3 text-danger" : "mt-3 text-success"}>
          {status?.text}
        </p>
        <button
          type="button"
          onClick={onUseDifferentEmail}
          className="mt-4 cursor-pointer rounded-control text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-forest"
        >
          Use a different email
        </button>
      </div>
    </div>
  );
}

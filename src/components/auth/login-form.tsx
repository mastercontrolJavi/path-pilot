"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { AUTH_ERROR_COPY, classifyAuthError, validateEmail, validatePassword, type AuthErrorKind } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "./field";

type Errors = { email?: string | null; password?: string | null };

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectParam = params.get("redirect");
  const redirectTo = safeRedirectPath(redirectParam, "/dashboard");
  const brokenLink = params.get("error") === "auth";
  const signupHref = redirectParam ? `/signup?redirect=${encodeURIComponent(redirectTo)}` : "/signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<AuthErrorKind | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState<"idle" | "sent" | "failed">("idle");
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = { email: validateEmail(email), password: validatePassword(password) };
    setErrors(next);
    if (next.email) return emailRef.current?.focus();
    if (next.password) return passwordRef.current?.focus();

    setLoading(true);
    setFormError(null);
    try {
      const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setFormError(classifyAuthError(error));
        setLoading(false);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      setFormError(classifyAuthError(error));
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    try {
      const { error } = await createClient().auth.resend({
        type: "signup",
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
      });
      setResent(error ? "failed" : "sent");
    } catch {
      setResent("failed");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-[400] tracking-[-0.01em] text-ink">Sign in</h1>
      <p className="mt-2 text-base text-ink-muted">Pick up your route where you left it.</p>

      {brokenLink && (
        <div className="mt-6">
          <FormError>
            That confirmation link has expired or was already used. Sign in below, or create your account again.
          </FormError>
        </div>
      )}

      <form noValidate onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
        <Field
          ref={emailRef}
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((x) => ({ ...x, email: validateEmail(e.target.value) }));
          }}
          onBlur={() => email && setErrors((x) => ({ ...x, email: validateEmail(email) }))}
        />
        <Field
          ref={passwordRef}
          id="password"
          label="Password"
          type="password"
          revealable
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((x) => ({ ...x, password: validatePassword(e.target.value) }));
          }}
          onBlur={() => password && setErrors((x) => ({ ...x, password: validatePassword(password) }))}
        />

        {formError && (
          <FormError>
            {AUTH_ERROR_COPY[formError]}
            {formError === "email_not_confirmed" && (
              <span className="mt-2 block">
                {resent === "sent" ? (
                  <span className="text-success">Sent. Check your inbox.</span>
                ) : (
                  <button
                    type="button"
                    onClick={resendConfirmation}
                    className="cursor-pointer rounded-control text-forest underline underline-offset-4"
                  >
                    {resent === "failed" ? "That didn't send. Try again" : "Send the link again"}
                  </button>
                )}
              </span>
            )}
          </FormError>
        )}

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading} aria-busy={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {loading ? "Signing in" : "Sign in"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-ink-muted">
        New to PathPilot?{" "}
        <Link href={signupHref} className="rounded-control font-medium text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-forest">
          Create an account
        </Link>
      </p>
    </div>
  );
}

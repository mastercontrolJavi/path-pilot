"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { track } from "@/lib/analytics";
import {
  AUTH_ERROR_COPY,
  classifyAuthError,
  validateEmail,
  validateName,
  validatePassword,
  type AuthErrorKind,
} from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "./field";
import { CheckEmail } from "./check-email";

type Errors = { name?: string | null; email?: string | null; password?: string | null };

const link = "rounded-control font-medium text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-forest";

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectParam = params.get("redirect");
  // New accounts head straight into their first route unless they were going somewhere specific.
  const next = safeRedirectPath(redirectParam, "/new");
  const loginHref = redirectParam ? `/login?redirect=${encodeURIComponent(next)}` : "/login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<AuthErrorKind | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const emailRedirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = { name: validateName(name), email: validateEmail(email), password: validatePassword(password) };
    setErrors(nextErrors);
    if (nextErrors.name) return nameRef.current?.focus();
    if (nextErrors.email) return emailRef.current?.focus();
    if (nextErrors.password) return passwordRef.current?.focus();

    setLoading(true);
    setFormError(null);
    try {
      const { data, error } = await createClient().auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() }, emailRedirectTo: emailRedirectTo() },
      });
      if (error) {
        setFormError(classifyAuthError(error));
        setLoading(false);
        return;
      }
      track("signup_completed");
      if (data.session) {
        // Email confirmation is off for this project: go straight on.
        router.push(next);
        router.refresh();
        return;
      }
      setSentTo(email.trim());
    } catch (error) {
      setFormError(classifyAuthError(error));
    }
    setLoading(false);
  }

  if (sentTo) {
    return (
      <CheckEmail
        email={sentTo}
        emailRedirectTo={emailRedirectTo()}
        onUseDifferentEmail={() => {
          setSentTo(null);
          setEmail("");
          setTimeout(() => emailRef.current?.focus(), 0);
        }}
      />
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-[400] tracking-[-0.01em] text-ink">Create your account</h1>
      <p className="mt-2 text-base text-ink-muted">
        Your route starts with your CV. The questions take about five minutes.
      </p>

      <form noValidate onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
        <Field
          ref={nameRef}
          id="name"
          label="Your name"
          autoComplete="name"
          value={name}
          error={errors.name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((x) => ({ ...x, name: validateName(e.target.value) }));
          }}
          onBlur={() => name && setErrors((x) => ({ ...x, name: validateName(name) }))}
        />
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
          autoComplete="new-password"
          hint="At least 6 characters."
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
            {formError === "already_registered" && (
              <>
                {" "}
                <Link href={loginHref} className={link}>
                  Sign in
                </Link>
              </>
            )}
          </FormError>
        )}

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading} aria-busy={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {loading ? "Creating your account" : "Create account"}
        </Button>
        <p className="text-sm text-ink-muted">
          By creating an account you agree to the{" "}
          <Link href="/terms" className={link}>
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className={link}>
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="mt-8 text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href={loginHref} className={link}>
          Sign in
        </Link>
      </p>
    </div>
  );
}

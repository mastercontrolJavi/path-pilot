import { CONTACT_EMAIL } from "@/config/site";

/**
 * Turn Supabase auth errors into what happened + how to fix it.
 * Never apologise, never be vague.
 */
export type AuthErrorKind =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "already_registered"
  | "weak_password"
  | "rate_limited"
  | "network"
  | "unknown";

export function classifyAuthError(error: unknown): AuthErrorKind {
  const message = (error instanceof Error ? error.message : String((error as { message?: string })?.message ?? error)).toLowerCase();
  if (message.includes("invalid login credentials")) return "invalid_credentials";
  if (message.includes("email not confirmed")) return "email_not_confirmed";
  if (message.includes("already registered") || message.includes("already been registered") || message.includes("already exists"))
    return "already_registered";
  if (message.includes("password should") || message.includes("weak password") || message.includes("password is too"))
    return "weak_password";
  if (message.includes("rate limit") || message.includes("too many") || message.includes("security purposes"))
    return "rate_limited";
  if (message.includes("fetch") || message.includes("network") || message.includes("load failed")) return "network";
  return "unknown";
}

export const AUTH_ERROR_COPY: Record<AuthErrorKind, string> = {
  invalid_credentials: "That email and password don't match an account. Check both, or create an account.",
  email_not_confirmed: "Your email isn't confirmed yet. Open the link we sent you, then sign in.",
  already_registered: "There's already an account with this email. Sign in instead.",
  weak_password: "That password is too easy to guess. Use a longer one with letters and numbers.",
  rate_limited: "Too many attempts in a row. Wait a minute, then try again.",
  network: "We couldn't reach the server. Check your connection and try again.",
  unknown: `That didn't go through. Try again, and if it keeps happening, email ${CONTACT_EMAIL}.`,
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(value.trim())) return "Enter an email like name@example.com.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Enter your password.";
  if (value.length < 6) return "Use at least 6 characters.";
  return null;
}

export function validateName(value: string): string | null {
  if (value.trim().length < 2) return "Enter your name, so your reports are addressed to you.";
  return null;
}

/** Webmail link for common providers, so "check your email" is one click. */
export function webmailFor(email: string): { label: string; href: string } | null {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return null;
  if (domain === "gmail.com" || domain === "googlemail.com") return { label: "Open Gmail", href: "https://mail.google.com/" };
  if (["outlook.com", "hotmail.com", "live.com", "msn.com"].includes(domain))
    return { label: "Open Outlook", href: "https://outlook.live.com/mail/" };
  if (domain.startsWith("yahoo.")) return { label: "Open Yahoo Mail", href: "https://mail.yahoo.com/" };
  if (["icloud.com", "me.com", "mac.com"].includes(domain)) return { label: "Open iCloud Mail", href: "https://www.icloud.com/mail" };
  if (["proton.me", "protonmail.com", "pm.me"].includes(domain)) return { label: "Open Proton Mail", href: "https://mail.proton.me/" };
  return null;
}

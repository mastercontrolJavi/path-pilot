import { describe, it, expect } from "vitest";
import { safeRedirectPath } from "../safe-redirect";
import { classifyAuthError, validateEmail, validatePassword, webmailFor } from "../auth-errors";

describe("safeRedirectPath", () => {
  it("keeps same-origin paths with query and hash", () => {
    expect(safeRedirectPath("/new")).toBe("/new");
    expect(safeRedirectPath("/analysis/abc?x=1#plan")).toBe("/analysis/abc?x=1#plan");
  });

  it("falls back for empty values", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard");
    expect(safeRedirectPath("", "/new")).toBe("/new");
  });

  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "\\\\evil.example",
    "@evil.example",
    ".evil.example",
    "javascript:alert(1)",
    "/foo\nbar",
    "evil.example/path",
  ])("rejects %s", (value) => {
    expect(safeRedirectPath(value)).toBe("/dashboard");
  });
});

describe("auth errors", () => {
  it("classifies Supabase messages", () => {
    expect(classifyAuthError(new Error("Invalid login credentials"))).toBe("invalid_credentials");
    expect(classifyAuthError({ message: "Email not confirmed" })).toBe("email_not_confirmed");
    expect(classifyAuthError(new Error("User already registered"))).toBe("already_registered");
    expect(classifyAuthError(new Error("For security purposes, you can only request this after 42 seconds."))).toBe("rate_limited");
    expect(classifyAuthError(new TypeError("Failed to fetch"))).toBe("network");
    expect(classifyAuthError(new Error("Something odd"))).toBe("unknown");
  });

  it("validates fields with fix-it messages", () => {
    expect(validateEmail("")).toMatch(/Enter your email/);
    expect(validateEmail("maya@")).toMatch(/name@example.com/);
    expect(validateEmail("maya@example.com")).toBeNull();
    expect(validatePassword("12345")).toMatch(/at least 6/);
    expect(validatePassword("123456")).toBeNull();
  });

  it("offers webmail for known providers only", () => {
    expect(webmailFor("a@gmail.com")?.label).toBe("Open Gmail");
    expect(webmailFor("a@outlook.com")?.href).toContain("outlook");
    expect(webmailFor("a@company.co")).toBeNull();
  });
});

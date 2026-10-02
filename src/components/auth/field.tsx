"use client";

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  error?: string | null;
  hint?: ReactNode;
  /** Adds a show/hide toggle for passwords. */
  revealable?: boolean;
};

/** Labelled input with an error (what's wrong, how to fix it) or a hint below. */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { id, label, error, hint, revealable, type, className, ...props },
  ref
) {
  const [revealed, setRevealed] = useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          type={revealable && revealed ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(revealable && "pr-12")}
          {...props}
        />
        {revealable && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center rounded-r-control text-ink-muted [--focus-offset:-2px] hover:text-ink"
          >
            {revealed ? <EyeOff className="size-[18px] stroke-[1.5]" /> : <Eye className="size-[18px] stroke-[1.5]" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

/** Form-level problem, announced when it appears. */
export function FormError({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-ink">
      {children}
    </div>
  );
}

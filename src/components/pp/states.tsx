import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StateProps = {
  /** What happened (or what's missing). */
  title: ReactNode;
  /** What to do about it. */
  description?: ReactNode;
  /** One action. */
  action?: ReactNode;
  align?: "start" | "center";
  className?: string;
  /** h1 when the state is the whole page (an error boundary), else h2. */
  titleAs?: "h1" | "h2";
};

/** Empty: a single waypoint not yet reached, an invitation, one action. */
export function EmptyState({ title, description, action, align = "start", className }: StateProps) {
  return (
    <div
      className={cn(
        "flex max-w-md flex-col gap-4 py-10",
        align === "center" && "mx-auto items-center text-center",
        className
      )}
    >
      <svg width="72" height="28" viewBox="0 0 72 28" aria-hidden className="overflow-visible">
        <path
          d="M8 14 C 26 4, 46 24, 64 14"
          fill="none"
          stroke="var(--color-contour)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 6"
        />
        <circle cx="8" cy="14" r="5" fill="var(--color-sheet)" stroke="var(--color-edge)" strokeWidth="1.5" />
      </svg>
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-[420] text-ink">{title}</h2>
        {description && <p className="text-base text-ink-muted">{description}</p>}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

/** Error: what happened, how to fix it, one action. Announced to assistive tech. */
export function ErrorState({ title, description, action, align = "start", className, titleAs: Title = "h2" }: StateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex max-w-md flex-col gap-4 py-10",
        align === "center" && "mx-auto items-center text-center",
        className
      )}
    >
      <svg width="72" height="28" viewBox="0 0 72 28" aria-hidden className="overflow-visible">
        <path d="M8 14 C 18 9, 26 9, 32 12" fill="none" stroke="var(--color-forest)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M42 16 C 50 19, 58 19, 64 14" fill="none" stroke="var(--color-contour)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 6" />
        <circle cx="8" cy="14" r="5" fill="var(--color-moss)" stroke="var(--color-forest)" strokeWidth="1.5" />
        <path d="M34 9 l6 6 M40 9 l-6 6" stroke="var(--color-danger)" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col gap-2">
        <Title className="font-display text-xl font-[420] text-ink">{title}</Title>
        {description && <p className="text-base text-ink-muted">{description}</p>}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

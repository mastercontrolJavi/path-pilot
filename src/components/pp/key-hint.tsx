import { cn } from "@/lib/utils";

/**
 * Keyboard shortcut chip (↵, 1, ⌘K). Desktop with a fine pointer only.
 * Decorative: put the real shortcut on the control with `aria-keyshortcuts`.
 */
export function KeyHint({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      aria-hidden
      className={cn(
        "hidden h-6 min-w-6 items-center justify-center rounded-[5px] border border-contour bg-sheet px-1.5 font-sans text-xs font-medium text-ink-muted shadow-[0_1px_0_var(--color-contour)] md:inline-flex pointer-coarse:hidden!",
        className
      )}
    >
      {children}
    </kbd>
  );
}

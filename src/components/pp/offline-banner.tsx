"use client";

import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** Shown only while the browser reports no connection. */
export function OfflineBanner() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true
  );
  if (online) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-contour bg-ink px-4 py-3 text-sm text-sheet print:hidden"
    >
      <p className="mx-auto flex max-w-page items-center gap-3">
        <WifiOff aria-hidden className="size-[18px] shrink-0 stroke-[1.5]" />
        {"You're offline. What you've typed stays on this page; reconnect to continue."}
      </p>
    </div>
  );
}

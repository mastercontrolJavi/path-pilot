"use client";

import { useEffect, useState } from "react";

// Set once an app page has mounted. A hard load, or arriving from the landing
// page, shows the page straight away; only moves within the app flow fade.
let mountedBefore = false;

/**
 * Remounts when the first segment changes (dashboard, new, analysis), which is
 * when the app-flow crossfade plays. CSS only, so pages that don't use motion
 * don't load its runtime for this.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  const [fade] = useState(() => mountedBefore);
  useEffect(() => {
    mountedBefore = true;
  }, []);
  return <div className={fade ? "pp-crossfade" : undefined}>{children}</div>;
}

"use client";

import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";

/*
 * Below-the-fold islands. The server renders a static, identical-looking
 * version (real HTML, no JS); the interactive module is fetched only when the
 * section comes within ~600px of the viewport, so it never counts against the
 * landing page's initial JavaScript. While it loads, the static version stays.
 */

const SampleReport = lazy(() =>
  import("@/components/report/sample-report").then((m) => ({ default: m.SampleReport }))
);
const FaqInteractive = lazy(() => import("./faq-interactive").then((m) => ({ default: m.FaqInteractive })));

function useNear(rootMargin = "600px") {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    // Without IntersectionObserver the static version simply stays.
    if (!el || near || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, rootMargin]);

  // Keyboard users can tab past a static section before it scrolls near, so the
  // first Tab press loads the interactive version straight away.
  useEffect(() => {
    if (near) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") setNear(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [near]);

  return [ref, near] as const;
}

export function LazySampleReport({ children }: { children: ReactNode }) {
  const [ref, near] = useNear();

  // sample_report_viewed: once, when a third of the section is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          track("sample_report_viewed");
          io.disconnect();
        }
      },
      { threshold: 0.33 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return (
    <div ref={ref}>
      {near ? (
        <Suspense fallback={children}>
          <SampleReport />
        </Suspense>
      ) : (
        children
      )}
    </div>
  );
}

export function LazyFaq({ children }: { children: ReactNode }) {
  const [ref, near] = useNear();
  return (
    <div ref={ref}>
      {near ? (
        <Suspense fallback={children}>
          <FaqInteractive />
        </Suspense>
      ) : (
        children
      )}
    </div>
  );
}

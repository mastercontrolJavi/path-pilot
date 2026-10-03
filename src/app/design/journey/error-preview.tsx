"use client";

import { PageError } from "@/components/app/page-error";

/** The app error boundary, rendered on demand for review. */
export function ErrorPreview() {
  const error = Object.assign(new Error("Preview"), { digest: "3141592653" });
  return <PageError error={error} reset={() => {}} />;
}

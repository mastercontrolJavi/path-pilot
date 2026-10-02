"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { Check, FileText, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RouteLine, RouteNode } from "@/components/pp/route";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { CV_MAX_BYTES, CV_MIN_CHARS, type CvState } from "./steps";
import { ERROR_ID, HELP_ID, StepHeading, TITLE_ID } from "./step-chrome";

type Reason = "wrong_type" | "too_large" | "unreadable";

/** Real checks before anything leaves the device: type, size, and a PDF header in the first bytes. */
async function checkFile(file: File): Promise<{ reason: Reason; message: string } | null> {
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
  if (file.type !== "application/pdf" && ext !== "pdf") {
    return {
      reason: "wrong_type",
      message: `That's ${ext ? `a .${ext} file` : "not a PDF"}. Upload a PDF, or paste your CV text instead.`,
    };
  }
  if (file.size === 0) {
    return { reason: "unreadable", message: "That file is empty. Export your CV as a PDF again and choose the new file." };
  }
  if (file.size > CV_MAX_BYTES) {
    return {
      reason: "too_large",
      message: `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB and the limit is 5 MB. Export a smaller PDF, or paste the text instead.`,
    };
  }
  const head = new TextDecoder().decode(await file.slice(0, 1024).arrayBuffer());
  if (!head.includes("%PDF-")) {
    return {
      reason: "wrong_type",
      message: "That file isn't a PDF inside, even though it's named like one. Export your CV as a PDF again, or paste the text.",
    };
  }
  return null;
}

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function CvStep({
  cv,
  onChange,
  error,
  onContinue,
}: {
  cv: CvState;
  onChange: (next: CvState) => void;
  error: string | null;
  onContinue: () => void;
}) {
  const inputId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (cv.mode === "paste") textRef.current?.focus({ preventScroll: true });
    else headingRef.current?.focus({ preventScroll: true });
    // Focus once, when the step opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function accept(file: File | undefined) {
    if (!file) return;
    const problem = await checkFile(file);
    if (problem) {
      setFileError(problem.message);
      track("cv_upload_failed", { reason: problem.reason });
      return;
    }
    setFileError(null);
    onChange({ ...cv, mode: "upload", file });
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    void accept(e.dataTransfer.files[0]);
  }

  const shownError = fileError ?? error;
  const chars = cv.text.trim().length;

  return (
    <div>
      <StepHeading ref={headingRef} title="Start with your CV" help="We read it to find the experience that transfers." />

      <Tabs
        value={cv.mode}
        onValueChange={(mode) => {
          setFileError(null);
          onChange({ ...cv, mode: mode as CvState["mode"] });
        }}
        className="mt-8"
      >
        <TabsList variant="track" aria-label="How to add your CV">
          <TabsTrigger value="upload">Upload a PDF</TabsTrigger>
          <TabsTrigger value="paste">Paste the text</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          {cv.file ? (
            <div className="rounded-panel border border-contour bg-sheet p-5">
              <div className="flex items-center gap-3">
                <FileText aria-hidden className="size-5 shrink-0 stroke-[1.5] text-ink-muted" />
                <span className="min-w-0 flex-1 truncate text-base text-ink">{cv.file.name}</span>
                <span className="font-mono text-sm text-ink-muted">{formatSize(cv.file.size)}</span>
              </div>
              {/* The checks passed: the route to "Ready" draws once. */}
              <div className="mt-4 flex items-center gap-3">
                <svg viewBox="0 0 200 16" aria-hidden className="h-4 flex-1 overflow-visible">
                  <RouteLine variant="rail" animateOnMount points={[{ x: 6, y: 8 }, { x: 194, y: 8 }]} style={{ "--route-duration": "0.6s" } as React.CSSProperties} />
                  <RouteNode x={6} y={8} r={4.5} state="done" />
                  <RouteNode x={194} y={8} r={4.5} state="done" revealDelay={0.6} />
                </svg>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
                  <Check aria-hidden className="size-4" strokeWidth={2} />
                  Ready
                </span>
              </div>
              <div className="mt-4 flex gap-5 text-sm">
                <label
                  htmlFor={inputId}
                  className="cursor-pointer rounded-control font-medium text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-forest has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest"
                >
                  Replace file
                  <input
                    id={inputId}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="sr-only"
                    onChange={(e) => void accept(e.target.files?.[0])}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onChange({ ...cv, file: null })}
                  className="cursor-pointer rounded-control text-ink-muted underline decoration-contour underline-offset-4 hover:text-ink"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor={inputId}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
              }}
              onDrop={onDrop}
              className={cn(
                "group flex cursor-pointer flex-col items-center gap-2 rounded-panel border-2 border-dashed border-edge bg-sheet px-6 py-12 text-center transition-[transform,border-color,background-color] duration-[180ms] hover:bg-fog motion-reduce:transform-none",
                "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-forest",
                dragging && "scale-[1.01] border-forest bg-fog"
              )}
            >
              <MapPin
                aria-hidden
                className={cn(
                  "size-8 stroke-[1.25] text-forest transition-transform duration-[180ms] motion-reduce:transform-none",
                  dragging && "-translate-y-1.5"
                )}
              />
              <span className="mt-1 font-display text-xl font-[420] text-ink md:text-2xl">Drop your CV here</span>
              <span className="text-base text-forest underline decoration-forest/40 underline-offset-4">or choose a file</span>
              <span className="mt-1 text-sm text-ink-muted">PDF, up to 5 MB</span>
              <input
                id={inputId}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                aria-describedby={shownError ? ERROR_ID : HELP_ID}
                onChange={(e) => void accept(e.target.files?.[0])}
              />
            </label>
          )}
        </TabsContent>

        <TabsContent value="paste">
          <Textarea
            ref={textRef}
            value={cv.text}
            onChange={(e) => onChange({ ...cv, text: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onContinue();
              }
            }}
            aria-labelledby={TITLE_ID}
            aria-describedby={shownError ? ERROR_ID : `${inputId}-count`}
            aria-invalid={shownError ? true : undefined}
            placeholder="Paste the text of your CV: roles, dates, what you did, skills, education."
            className="min-h-64"
          />
          <p id={`${inputId}-count`} className="mt-2 text-sm text-ink-muted">
            <span className="font-mono text-ink">{chars}</span> characters
            {chars > 0 && chars < CV_MIN_CHARS && <span>, at least {CV_MIN_CHARS} needed</span>}
          </p>
        </TabsContent>
      </Tabs>

      <p id={ERROR_ID} role={shownError ? "alert" : undefined} className="min-h-6 pt-3 text-sm text-danger">
        {shownError}
      </p>

      {/* Disclosure at the moment of handing over the CV (Privacy Policy, section 3). */}
      <p className="mt-2 max-w-[60ch] text-sm text-ink-muted">
        Your CV is sent to OpenAI to write your report and is stored in your account. We don&apos;t sell your data.{" "}
        <Link href="/privacy" className="rounded-control text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-forest">
          Privacy policy
        </Link>
      </p>
    </div>
  );
}

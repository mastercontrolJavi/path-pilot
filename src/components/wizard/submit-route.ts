import { createClient } from "@/lib/supabase/client";
import { sizeBucket, track } from "@/lib/analytics";
import type { RunOutcome } from "@/components/analysis/analysis-run";
import { toQuestionnaire, type Answers, type CvState } from "./steps";

/** Remembers the last upload so "Try again" doesn't upload the same file twice. */
export type UploadMemo = { file: File | null; path: string | null };

/**
 * Same contract as before the redesign: PDFs go to the private cv-uploads
 * bucket at {user_id}/..., then /api/analyze receives the text (or the file
 * path) plus the questionnaire. Failures come back as a kind the UI can
 * explain, never as a thrown error. `onSent` marks the real moment the CV has
 * left the device.
 */
export async function submitRoute({
  answers,
  cv,
  onSent,
  memo,
}: {
  answers: Answers;
  cv: CvState;
  onSent?: () => void;
  memo?: UploadMemo;
}): Promise<RunOutcome> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, kind: "session" };

    let cvText = cv.text.trim();
    let cvFilePath: string | undefined;

    if (cv.mode === "upload" && cv.file) {
      if (memo && memo.file === cv.file && memo.path) {
        cvFilePath = memo.path;
      } else {
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;
        const { error } = await supabase.storage.from("cv-uploads").upload(path, cv.file);
        if (error) {
          track("cv_upload_failed", { reason: "network" });
          return { ok: false, kind: "upload" };
        }
        cvFilePath = path;
        if (memo) {
          memo.file = cv.file;
          memo.path = path;
        }
        track("cv_uploaded", { type: "pdf", size_bucket: sizeBucket(cv.file.size) });
      }
      cvText = "(PDF uploaded - see file)";
    } else {
      track("cv_uploaded", { type: "text", size_bucket: "n/a" });
    }

    onSent?.();
    track("analysis_started");
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvText, cvFilePath, questionnaire: toQuestionnaire(answers) }),
    });
    const body = (await response.json().catch(() => ({}))) as { analysisId?: string; error?: string };

    if (response.status === 401) return { ok: false, kind: "session" };
    if (response.status === 504) return { ok: false, kind: "timeout" };
    if (!response.ok || !body.analysisId) {
      if (/extract|pdf/i.test(body.error ?? "")) {
        track("cv_upload_failed", { reason: "unreadable" });
        return { ok: false, kind: "unreadable" };
      }
      return { ok: false, kind: "server" };
    }
    return { ok: true, analysisId: body.analysisId };
  } catch {
    return { ok: false, kind: "network" };
  }
}

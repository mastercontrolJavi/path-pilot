"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface FeedbackWidgetProps {
  analysisId: string;
}

/** Was this report useful? Writes to analysis_feedback (owner-only RLS). */
export function FeedbackWidget({ analysisId }: FeedbackWidgetProps) {
  const [submitted, setSubmitted] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const submit = async (isHelpful: boolean) => {
    setHelpful(isHelpful);
    if (!isHelpful) {
      setShowNotes(true);
      return;
    }
    await sendFeedback(isHelpful, "");
  };

  const sendFeedback = async (isHelpful: boolean, feedbackNotes: string) => {
    setLoading(true);
    setFailed(false);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setFailed(true);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("analysis_feedback").insert({
      analysis_id: analysisId,
      user_id: user.id,
      helpful: isHelpful,
      notes: feedbackNotes || null,
    });

    if (error) setFailed(true);
    else setSubmitted(true);
    setLoading(false);
  };

  return (
    <section aria-labelledby="feedback-title" aria-live="polite" className="border-t border-contour pt-8 print:hidden">
      {submitted ? (
        <p className="text-base text-ink">Thanks. Your feedback shapes how routes are built.</p>
      ) : (
        <>
          <h2 id="feedback-title" className="text-base font-medium text-ink">
            Was this report useful?
          </h2>
          {!showNotes ? (
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" onClick={() => submit(true)} disabled={loading}>
                Yes
              </Button>
              <Button variant="secondary" onClick={() => submit(false)} disabled={loading}>
                Not really
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex max-w-lg flex-col gap-3">
              <Label htmlFor="feedback-notes" className="font-normal text-ink-muted">
                What would have made it more useful?
              </Label>
              <Textarea id="feedback-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              <div>
                <Button onClick={() => sendFeedback(helpful!, notes)} disabled={loading} aria-busy={loading}>
                  {loading ? "Sending" : "Send feedback"}
                </Button>
              </div>
            </div>
          )}
          {failed && (
            <p role="alert" className="mt-3 text-sm text-danger">
              That didn&apos;t send. Check your connection and try again.
            </p>
          )}
        </>
      )}
    </section>
  );
}

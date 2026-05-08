"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface FeedbackWidgetProps {
  analysisId: string;
}

export function FeedbackWidget({ analysisId }: FeedbackWidgetProps) {
  const [submitted, setSubmitted] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

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
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to submit feedback");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("analysis_feedback").insert({
      analysis_id: analysisId,
      user_id: user.id,
      helpful: isHelpful,
      notes: feedbackNotes || null,
    });

    if (error) {
      toast.error("Failed to submit feedback");
    } else {
      setSubmitted(true);
      toast.success("Thanks for your feedback!");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <div className="border border-border/50 rounded-xl p-6 bg-white text-center">
      <p className="text-sm font-medium mb-4">Was this analysis helpful?</p>
      {!showNotes ? (
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => submit(true)}
            className="gap-2"
          >
            <ThumbsUp className="w-4 h-4" /> Yes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => submit(false)}
            className="gap-2"
          >
            <ThumbsDown className="w-4 h-4" /> Not really
          </Button>
        </div>
      ) : (
        <div className="max-w-sm mx-auto space-y-3">
          <Textarea
            placeholder="What could be better?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <Button
            size="sm"
            onClick={() => sendFeedback(helpful!, notes)}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send feedback"}
          </Button>
        </div>
      )}
    </div>
  );
}

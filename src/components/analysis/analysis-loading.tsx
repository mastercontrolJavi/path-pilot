"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LOADING_MESSAGES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export function AnalysisLoading({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/analyze/${analysisId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "completed" || data.status === "failed") {
          router.refresh();
        }
      } catch {
        // Retry on next poll
      }
    }, 3000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(pollInterval);
    };
  }, [analysisId, router]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white border border-border/50 flex items-center justify-center mb-6">
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Analyzing your profile</h2>
      <p className="text-sm text-muted-foreground animate-pulse">
        {LOADING_MESSAGES[messageIndex]}
      </p>
      <p className="text-xs text-muted-foreground mt-4">
        This usually takes 30-60 seconds
      </p>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { LOADING_MESSAGES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AnalysisLoadingProps {
  analysisId: string;
}

export function AnalysisLoading({ analysisId }: AnalysisLoadingProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const router = useRouter();

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Poll for completion
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/analyze/${analysisId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "completed" || data.status === "failed") {
        router.refresh();
      }
    } catch {
      // ignore polling errors
    }
  }, [analysisId, router]);

  useEffect(() => {
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [poll]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-lg font-medium text-foreground/80"
        >
          {LOADING_MESSAGES[messageIndex]}
        </motion.p>
      </AnimatePresence>
      <p className="text-sm text-muted-foreground mt-4">
        This usually takes 15-30 seconds
      </p>
    </div>
  );
}

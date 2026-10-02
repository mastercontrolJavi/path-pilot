"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Wizard } from "./wizard";
import { submitRoute, type UploadMemo } from "./submit-route";

/** /new: the wizard wired to the real upload and analysis. */
export function NewRoute({ userId }: { userId: string }) {
  const router = useRouter();
  // "Try again" reuses the file already uploaded in this visit.
  const memo = useRef<UploadMemo>({ file: null, path: null });
  return (
    <Wizard
      storageKey={`pp:wizard:v1:${userId}`}
      submit={(input) => submitRoute({ ...input, memo: memo.current })}
      onDone={(analysisId) => router.push(`/analysis/${analysisId}`)}
    />
  );
}

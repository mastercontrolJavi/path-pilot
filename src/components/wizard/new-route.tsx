"use client";

import { useRouter } from "next/navigation";
import { Wizard } from "./wizard";
import { submitRoute } from "./submit-route";

/** /new: the wizard wired to the real upload and analysis. */
export function NewRoute({ userId }: { userId: string }) {
  const router = useRouter();
  return (
    <Wizard
      storageKey={`pp:wizard:v1:${userId}`}
      submit={submitRoute}
      onDone={(analysisId) => router.push(`/analysis/${analysisId}`)}
    />
  );
}

# Proposal: stream the analysis (opt-in, not implemented)

Status: proposed in Phase 4. Nothing here is built; it needs your go-ahead because it changes `/api/analyze`.

## Why

Today `/api/analyze` waits for the whole report before responding. The analysis screen can only be honest about two moments (the CV being sent, and the report existing), so the stages in between follow a cautious time curve. Streaming would let every stage advance on real events and show partial findings as they arrive (for example the first matched role appearing under "Matching roles").

## What would change

1. **API**: `/api/analyze` switches from `generateObject` to the AI SDK's `streamObject` with the **same** `analysisResultSchema`, and returns a stream of partial objects. The analysis row is still created first and saved (`status: completed`) in `onFinish`, so the stored report shape is unchanged.
2. **Client**: `AnalysisRun` reads the stream. Stage changes are driven by which fields have arrived: `summary` → reading, `strengths` → transferable skills, `career_paths[0]` → matching (show its title), `salary_estimate` → pay, `action_plan` → plan.
3. **Leaving the page**: the stream ends if the tab closes, but generation continues server-side until `onFinish` saves the row, so the dashboard still shows the report. (Verify on Vercel: the function must not be cancelled when the client disconnects.)

## Risks

- Partial objects can contain incomplete strings; render only fields that are complete (arrays with closed items).
- Structured output with streaming must still pass OpenAI strict mode (the existing strict-schema test covers the schema).
- A second code path for errors mid-stream (timeouts after partial data).

## Effort

About a day including tests. No database change, no schema change, no prompt change.

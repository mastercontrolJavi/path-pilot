/**
 * Opt-in live check: one real generation against OpenAI with the current
 * schema and prompt, using a synthetic CV (no personal data). Catches schema
 * changes that strict structured outputs would reject.
 *
 *   RUN_LIVE_AI=1 npx vitest run src/lib/__tests__/analysis.live.test.ts
 *
 * Reads OPENAI_API_KEY (and optional OPENAI_MODEL) from .env.local.
 */
import { existsSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { analysisResultSchema, type QuestionnaireData } from "../schemas";
import { buildAnalysisPrompt, SYSTEM_PROMPT } from "../prompts";

const live = process.env.RUN_LIVE_AI === "1";
if (live && existsSync(".env.local")) process.loadEnvFile(".env.local");

const cv = `Operations Coordinator, Northline Supply Co. (2019-2025)
- Rebuilt the order-exception workflow across warehouse and support; resolution time fell from 4 days to 1.5.
- Ran a weekly sync with 14 suppliers and 3 internal teams; owned escalations end to end.
- Wrote the SOP library used to train new hires; produced incident summaries for quarterly reviews.
Logistics Assistant, Harbor Freight Partners (2017-2019)
- Scheduled inbound shipments and reconciled carrier invoices.
Skills: Excel, Google Sheets, Asana, vendor management, process documentation.`;

const questionnaire: QuestionnaireData = {
  preferred_work_style: ["Structured", "People-focused"],
  career_priorities: ["Growth", "Remote flexibility", "High income"],
  things_i_enjoy: "Fixing broken processes and getting teams to agree on how work should flow.",
  things_i_dislike: "Cold calling, and being the person who only schedules other people's work.",
  past_experiences: "Six years in operations coordination and logistics.",
  target_location: "Remote, United States",
  salary_goal: "$85k+",
  biggest_current_problem: "I know I want out of operations but can't tell where my experience transfers.",
  industries_of_interest: "Software, SaaS",
  hard_constraints: "No relocation",
  education_status: "No formal degree / self-taught",
};

describe.skipIf(!live)("live analysis (OpenAI)", () => {
  it(
    "produces a v2 report that passes the schema",
    async () => {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const started = Date.now();
      const { object } = await generateObject({
        model: openai(process.env.OPENAI_MODEL || "gpt-4o"),
        schema: analysisResultSchema,
        system: SYSTEM_PROMPT,
        prompt: buildAnalysisPrompt(cv, questionnaire),
      });
      const seconds = ((Date.now() - started) / 1000).toFixed(1);

      expect(analysisResultSchema.safeParse(object).success).toBe(true);
      console.log(`generated in ${seconds}s`);
      for (const p of object.career_paths) {
        const pay = p.salary_estimate
          ? `${p.salary_estimate.currency} ${p.salary_estimate.low}-${p.salary_estimate.high}/${p.salary_estimate.period} (${p.salary_estimate.basis})`
          : "no estimate";
        console.log(`- ${p.title} ${p.fit_score}% | ${pay} | brings ${p.skills_you_bring.length}, builds ${p.skills_to_build.length}`);
      }
    },
    240_000
  );
});

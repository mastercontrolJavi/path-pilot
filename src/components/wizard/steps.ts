import { QUESTIONS, type QuestionDefinition } from "@/lib/constants";
import { QUESTIONNAIRE_RULES, type RuledField } from "@/lib/questionnaire-rules";
// Type-only: keeps zod out of the wizard's client bundle.
import type { QuestionnaireData } from "@/lib/schemas";

/*
 * The wizard's path: CV first (unchanged order), each question, then review.
 * Pure functions only, so the rules are testable without rendering.
 */

export type Step =
  | { id: "cv"; kind: "cv"; short: string }
  | { id: string; kind: "question"; short: string; question: QuestionDefinition }
  | { id: "review"; kind: "review"; short: string };

export const STEPS: Step[] = [
  { id: "cv", kind: "cv", short: "Your CV" },
  ...QUESTIONS.map((question) => ({ id: question.id, kind: "question" as const, short: question.short, question })),
  { id: "review", kind: "review", short: "Review" },
];

export const REVIEW_INDEX = STEPS.length - 1;

export type Answers = {
  preferred_work_style: string[];
  career_priorities: string[];
  things_i_enjoy: string;
  things_i_dislike: string;
  past_experiences: string;
  target_location: string;
  salary_goal: string;
  biggest_current_problem: string;
  industries_of_interest: string;
  hard_constraints: string;
  education_status: QuestionnaireData["education_status"] | "";
};

export const EMPTY_ANSWERS: Answers = {
  preferred_work_style: [],
  career_priorities: [],
  things_i_enjoy: "",
  things_i_dislike: "",
  past_experiences: "",
  target_location: "",
  salary_goal: "",
  biggest_current_problem: "",
  industries_of_interest: "",
  hard_constraints: "",
  education_status: "",
};

export type CvState = { mode: "upload" | "paste"; file: File | null; text: string };

export const CV_MIN_CHARS = 50;
export const CV_MAX_BYTES = 5 * 1024 * 1024;

/** What's wrong with this step's answer, or null when it can be left. */
export function validateStep(step: Step, answers: Answers, cv: CvState): string | null {
  if (step.kind === "review") return null;
  if (step.kind === "cv") {
    if (cv.mode === "upload") return cv.file ? null : "Add your CV as a PDF, or paste the text instead.";
    const n = cv.text.trim().length;
    if (n === 0) return "Paste your CV text, or upload a PDF instead.";
    if (n < CV_MIN_CHARS) return `Add a little more: at least ${CV_MIN_CHARS} characters (you have ${n}).`;
    return null;
  }

  const q = step.question;
  const value = answers[q.fieldName as keyof Answers];

  if (q.type === "single-select") {
    return value ? null : q.required ? "Choose one to continue." : null;
  }
  if (!q.required && (value === "" || (Array.isArray(value) && value.length === 0))) return null;

  const rule = QUESTIONNAIRE_RULES[q.fieldName as RuledField];
  if (!rule) return null;
  if (Array.isArray(value)) {
    const max = "max" in rule ? rule.max : Infinity;
    if (value.length >= rule.min && value.length <= max) return null;
    const words = ["zero", "one", "two", "three", "four", "five"];
    return q.maxSelections ? `Pick at least one, and no more than ${words[q.maxSelections] ?? q.maxSelections}.` : "Pick at least one.";
  }
  if (typeof value === "string" && value.trim().length >= rule.min) return null;
  return `${rule.message}. A sentence is plenty.`;
}

/** The answers in the shape /api/analyze expects. */
export function toQuestionnaire(answers: Answers): QuestionnaireData {
  const opt = (s: string) => (s.trim() ? s.trim() : undefined);
  return {
    preferred_work_style: answers.preferred_work_style,
    career_priorities: answers.career_priorities,
    things_i_enjoy: answers.things_i_enjoy.trim(),
    things_i_dislike: answers.things_i_dislike.trim(),
    past_experiences: answers.past_experiences.trim(),
    target_location: answers.target_location.trim(),
    salary_goal: opt(answers.salary_goal),
    biggest_current_problem: answers.biggest_current_problem.trim(),
    industries_of_interest: opt(answers.industries_of_interest),
    hard_constraints: opt(answers.hard_constraints),
    education_status: answers.education_status || undefined,
  };
}

/** First step that still needs something, or null when everything is ready. */
export function firstIncomplete(answers: Answers, cv: CvState): number | null {
  for (let i = 0; i < REVIEW_INDEX; i++) if (validateStep(STEPS[i], answers, cv)) return i;
  return null;
}

/** Short text for the rail chip and the review list. */
export function summarize(step: Step, answers: Answers, cv: CvState): string | null {
  if (step.kind === "review") return null;
  if (step.kind === "cv") {
    if (cv.mode === "upload") return cv.file?.name ?? null;
    return cv.text.trim() ? `${cv.text.trim().length} characters pasted` : null;
  }
  const q = step.question;
  const value = answers[q.fieldName as keyof Answers];
  if (Array.isArray(value)) return value.length ? value.join(", ") : null;
  if (q.choices) return q.choices.find((c) => c.value === value)?.label ?? null;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

// Rough seconds per step, for "About N min left".
function secondsFor(step: Step): number {
  if (step.kind === "cv") return 60;
  if (step.kind === "review") return 30;
  const q = step.question;
  if (q.type === "multi-select") return 15;
  if (q.type === "single-select") return 8;
  if (!q.required) return 15;
  return q.multiline ? 45 : 15;
}

export function timeLeftLabel(fromIndex: number): string {
  const seconds = STEPS.slice(fromIndex).reduce((n, s) => n + secondsFor(s), 0);
  if (seconds < 60) return "Under a minute left";
  return `About ${Math.round(seconds / 60)} min left`;
}

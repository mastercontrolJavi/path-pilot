import { z } from "zod/v4";
import { QUESTIONNAIRE_RULES } from "./questionnaire-rules";

const R = QUESTIONNAIRE_RULES;

export const questionnaireSchema = z.object({
  preferred_work_style: z.array(z.string()).min(R.preferred_work_style.min, R.preferred_work_style.message),
  career_priorities: z
    .array(z.string())
    .min(R.career_priorities.min, R.career_priorities.message)
    .max(R.career_priorities.max, R.career_priorities.maxMessage),
  things_i_enjoy: z.string().min(R.things_i_enjoy.min, R.things_i_enjoy.message),
  things_i_dislike: z.string().min(R.things_i_dislike.min, R.things_i_dislike.message),
  past_experiences: z.string().min(R.past_experiences.min, R.past_experiences.message),
  target_location: z.string().min(R.target_location.min, R.target_location.message),
  salary_goal: z.string().optional(),
  biggest_current_problem: z.string().min(R.biggest_current_problem.min, R.biggest_current_problem.message),
  industries_of_interest: z.string().optional(),
  hard_constraints: z.string().optional(),
  // Added in report v2. Optional so older clients and saved drafts still validate.
  education_status: z.enum(["enrolled", "graduated", "no_degree"]).optional(),
});

export type QuestionnaireData = z.infer<typeof questionnaireSchema>;

export const EDUCATION_STATUS_LABELS: Record<NonNullable<QuestionnaireData["education_status"]>, string> = {
  enrolled: "Currently studying",
  graduated: "Graduated (degree or diploma)",
  no_degree: "No degree",
};

export const strengthSchema = z.object({
  name: z.string(),
  score: z.number().min(1).max(10),
  evidence: z.string(),
  why_it_matters: z.string(),
});

/*
 * Report v2 fields (per career path). OpenAI strict structured outputs require
 * every key, so "unknown" is expressed as null, never as a missing key.
 * Reports generated before v2 lack these keys; read them through
 * `normalizeAnalysisResult`.
 */
export const salaryEstimateSchema = z.object({
  currency: z.string().describe("ISO 4217 code for the target location, e.g. USD, GBP, EUR"),
  low: z.number().describe("Lower end of a typical base salary for this role at the user's likely level"),
  high: z.number().describe("Upper end of that typical range"),
  period: z.enum(["year", "hour"]),
  basis: z
    .string()
    .describe("One short phrase saying what the estimate assumes, e.g. 'Mid-level, Remote US, base salary'"),
});

export const skillToBuildSchema = z.object({
  skill: z.string(),
  effort: z.enum(["days", "weeks", "months"]).describe("Rough time to close this gap from the user's starting point"),
  how: z.string().describe("One concrete way to build it: a project, course type, or certification"),
});

export const careerPathSchema = z.object({
  title: z.string(),
  fit_score: z.number().min(1).max(100),
  why_it_fits: z.string(),
  why_it_is_realistic: z.string(),
  example_job_titles: z.array(z.string()).length(5),
  best_for: z.string(),
  tradeoff: z.string(),
  salary_estimate: salaryEstimateSchema
    .nullable()
    .describe("Null if the target location is too vague to estimate responsibly"),
  skills_you_bring: z
    .array(z.string())
    .min(2)
    .max(6)
    .describe("Skills from the CV that transfer directly to this role"),
  skills_to_build: z
    .array(skillToBuildSchema)
    .min(1)
    .max(5)
    .describe("The most important gaps between the user and this role, most important first"),
});

export const avoidRoleSchema = z.object({
  role_type: z.string(),
  reason: z.string(),
});

export const actionStepSchema = z.object({
  step: z.number().min(1).max(7),
  title: z.string(),
  details: z.string(),
});

export const cvRewriteSchema = z.object({
  before: z.string(),
  after: z.string(),
  why_better: z.string(),
});

export const analysisResultSchema = z.object({
  summary: z.string(),
  strengths: z.array(strengthSchema).length(3),
  career_paths: z.array(careerPathSchema).length(3),
  avoid_roles: z.array(avoidRoleSchema).min(2).max(3),
  action_plan: z.array(actionStepSchema).length(7),
  cv_rewrites: z.array(cvRewriteSchema).min(2).max(3),
  confidence_note: z.string(),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type CareerPath = AnalysisResult["career_paths"][number];
export type SalaryEstimate = NonNullable<CareerPath["salary_estimate"]>;

/**
 * Read a stored result from either report version. Reports generated before
 * v2 have no pay or skills per path; those keys come back as `null` / `[]`
 * so the UI can show "not in this report" instead of failing on undefined.
 */
export function normalizeAnalysisResult(raw: unknown): AnalysisResult {
  const result = raw as AnalysisResult;
  return {
    ...result,
    career_paths: result.career_paths.map((path) => ({
      ...path,
      salary_estimate: path.salary_estimate ?? null,
      skills_you_bring: path.skills_you_bring ?? [],
      skills_to_build: path.skills_to_build ?? [],
    })),
  };
}

/** True for reports generated before pay and skills were added. */
export function isLegacyResult(raw: unknown): boolean {
  const paths = (raw as { career_paths?: Array<Record<string, unknown>> })?.career_paths ?? [];
  return paths.some((p) => !("skills_you_bring" in p));
}

// API request schema
export const analyzeRequestSchema = z.object({
  cvText: z.string().min(1, "CV text is required"),
  cvFilePath: z.string().optional(),
  questionnaire: questionnaireSchema,
}).refine(
  (data) => data.cvFilePath || data.cvText.length >= 50,
  { message: "CV text must be at least 50 characters (or upload a PDF)", path: ["cvText"] }
);

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

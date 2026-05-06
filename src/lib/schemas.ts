import { z } from "zod/v4";

export const questionnaireSchema = z.object({
  preferred_work_style: z.array(z.string()).min(1, "Select at least one work style"),
  career_priorities: z.array(z.string()).min(1, "Select at least one priority").max(3, "Select up to 3 priorities"),
  things_i_enjoy: z.string().min(10, "Tell us a bit more about what you enjoy"),
  things_i_dislike: z.string().min(10, "Tell us a bit more about what you dislike"),
  past_experiences: z.string().min(10, "Briefly describe your past experiences"),
  target_location: z.string().min(2, "Enter your target location"),
  salary_goal: z.string().optional(),
  biggest_current_problem: z.string().min(10, "Describe your biggest challenge"),
  industries_of_interest: z.string().optional(),
  hard_constraints: z.string().optional(),
});

export type QuestionnaireData = z.infer<typeof questionnaireSchema>;

export const strengthSchema = z.object({
  name: z.string(),
  score: z.number().min(1).max(10),
  evidence: z.string(),
  why_it_matters: z.string(),
});

export const careerPathSchema = z.object({
  title: z.string(),
  fit_score: z.number().min(1).max(100),
  why_it_fits: z.string(),
  why_it_is_realistic: z.string(),
  example_job_titles: z.array(z.string()).length(5),
  best_for: z.string(),
  tradeoff: z.string(),
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

export type { AnalysisResult, QuestionnaireData, AnalyzeRequest } from "@/lib/schemas";

export interface AnalysisRow {
  id: string;
  user_id: string;
  cv_text: string;
  cv_file_path: string | null;
  questionnaire: Record<string, unknown>;
  result: Record<string, unknown> | null;
  status: "pending" | "processing" | "completed" | "failed";
  error_message: string | null;
  created_at: string;
}

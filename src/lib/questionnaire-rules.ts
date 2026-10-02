/**
 * Minimum answers for the questionnaire, shared by the server schema
 * (schemas.ts) and the wizard's client-side checks, which avoid shipping zod.
 */
export const QUESTIONNAIRE_RULES = {
  preferred_work_style: { min: 1, message: "Select at least one work style" },
  career_priorities: { min: 1, max: 3, message: "Select at least one priority", maxMessage: "Select up to 3 priorities" },
  things_i_enjoy: { min: 10, message: "Tell us a bit more about what you enjoy" },
  things_i_dislike: { min: 10, message: "Tell us a bit more about what you dislike" },
  past_experiences: { min: 10, message: "Briefly describe your past experiences" },
  target_location: { min: 2, message: "Enter your target location" },
  biggest_current_problem: { min: 10, message: "Describe your biggest challenge" },
} as const;

export type RuledField = keyof typeof QUESTIONNAIRE_RULES;

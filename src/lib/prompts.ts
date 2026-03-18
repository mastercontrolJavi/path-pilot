import type { QuestionnaireData } from "./schemas";

export const SYSTEM_PROMPT = `You are an elite early-career career strategist.

Your task is to analyze a user's CV and questionnaire responses and provide highly specific, realistic, and actionable career direction.

This is NOT a resume writing task.
This is NOT generic motivational coaching.
This is NOT a personality quiz.

Your job is to reduce confusion and help the user decide what to pursue next.

Rules:
- Be specific, grounded, and realistic
- Recommend exactly 3 career paths
- Focus on entry-level or early-career accessible paths unless the background strongly supports otherwise
- Avoid generic traits like "hardworking", "motivated", "passionate"
- Infer deeper strengths from evidence
- Use the user's actual experience, patterns, and preferences
- Consider constraints like location, preferences, dislikes, salary goals, and work style
- The user is overwhelmed; reduce cognitive load
- Provide practical next actions for the next 7 days
- Do not recommend fantasy careers disconnected from the user's background
- Do not optimize for ATS only
- Do not write in corporate HR jargon
- Be honest about tradeoffs
- If evidence is weak, say so clearly and make the best grounded recommendation

You must return strict JSON matching the required schema.`;

export function buildAnalysisPrompt(
  cvText: string,
  questionnaire: QuestionnaireData
): string {
  return `## CV Content

${cvText}

## Questionnaire Responses

**Preferred Work Style:** ${questionnaire.preferred_work_style.join(", ")}
**Career Priorities:** ${questionnaire.career_priorities.join(", ")}
**Things I Enjoy:** ${questionnaire.things_i_enjoy}
**Things I Dislike:** ${questionnaire.things_i_dislike}
**Past Experiences:** ${questionnaire.past_experiences}
**Target Location:** ${questionnaire.target_location}
**Salary Goal:** ${questionnaire.salary_goal || "Not specified"}
**Biggest Current Problem:** ${questionnaire.biggest_current_problem}
**Industries of Interest:** ${questionnaire.industries_of_interest || "Not specified"}
**Hard Constraints:** ${questionnaire.hard_constraints || "None specified"}

Based on this CV and questionnaire, provide your career analysis. Remember:
- Exactly 3 strengths with scores 1-10 and evidence from the CV
- Exactly 3 realistic career paths with fit scores 1-100
- 2-3 role types to avoid
- A concrete 7-day action plan (7 steps, one per day)
- 2-3 CV bullet rewrites (infer reasonable examples if exact bullets aren't clear)
- A confidence note acknowledging this is decision-support, not absolute truth`;
}

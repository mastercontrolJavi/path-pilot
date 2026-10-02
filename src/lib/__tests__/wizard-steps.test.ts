import { describe, it, expect } from "vitest";
import {
  EMPTY_ANSWERS,
  STEPS,
  REVIEW_INDEX,
  firstIncomplete,
  summarize,
  timeLeftLabel,
  toQuestionnaire,
  validateStep,
  type Answers,
  type CvState,
} from "@/components/wizard/steps";
import { QUESTIONS } from "@/lib/constants";
import { questionnaireSchema } from "@/lib/schemas";

const noCv: CvState = { mode: "upload", file: null, text: "" };
const pasted: CvState = { mode: "paste", file: null, text: "x".repeat(80) };
const step = (id: string) => STEPS.find((s) => s.id === id)!;

const complete: Answers = {
  ...EMPTY_ANSWERS,
  preferred_work_style: ["Structured"],
  career_priorities: ["Growth"],
  things_i_enjoy: "Fixing broken processes",
  things_i_dislike: "Cold calling all day",
  past_experiences: "Six years in operations",
  target_location: "Remote US",
  biggest_current_problem: "I can't tell where my experience transfers",
  education_status: "no_degree",
};

describe("wizard steps", () => {
  it("keeps the CV first and the existing question order, with education added after experience", () => {
    expect(STEPS[0].id).toBe("cv");
    expect(STEPS[REVIEW_INDEX].id).toBe("review");
    expect(QUESTIONS.map((q) => q.fieldName)).toEqual([
      "preferred_work_style",
      "career_priorities",
      "things_i_enjoy",
      "things_i_dislike",
      "past_experiences",
      "education_status",
      "target_location",
      "salary_goal",
      "biggest_current_problem",
      "industries_of_interest",
      "hard_constraints",
    ]);
  });

  it("keeps helper text to 15 words or fewer", () => {
    for (const q of QUESTIONS) expect(q.description.split(/\s+/).length).toBeLessThanOrEqual(15);
  });

  it("validates the CV in either mode", () => {
    expect(validateStep(step("cv"), complete, noCv)).toMatch(/PDF/);
    expect(validateStep(step("cv"), complete, { mode: "paste", file: null, text: "short" })).toMatch(/at least 50/);
    expect(validateStep(step("cv"), complete, pasted)).toBeNull();
  });

  it("uses the schema's rules for questions", () => {
    expect(validateStep(step("q3"), { ...complete, things_i_enjoy: "fun" }, pasted)).toMatch(/A sentence is plenty/);
    expect(validateStep(step("q2"), { ...complete, career_priorities: [] }, pasted)).toMatch(/no more than three/);
    expect(validateStep(step("q_education"), { ...complete, education_status: "" }, pasted)).toBe("Choose one to continue.");
    expect(validateStep(step("q7"), complete, pasted)).toBeNull(); // optional and empty
  });

  it("finds the first step that needs attention", () => {
    expect(firstIncomplete(complete, noCv)).toBe(0);
    expect(firstIncomplete({ ...complete, target_location: "" }, pasted)).toBe(STEPS.findIndex((s) => s.id === "q6"));
    expect(firstIncomplete(complete, pasted)).toBeNull();
  });

  it("produces a questionnaire the API accepts", () => {
    const q = toQuestionnaire({ ...complete, salary_goal: "  " });
    expect(q.salary_goal).toBeUndefined();
    expect(questionnaireSchema.safeParse(q).success).toBe(true);
  });

  it("summarizes answers for the rail", () => {
    expect(summarize(step("q1"), { ...complete, preferred_work_style: ["Structured", "Analytical"] }, pasted)).toBe(
      "Structured, Analytical"
    );
    expect(summarize(step("q_education"), complete, pasted)).toBe("No degree");
    expect(summarize(step("cv"), complete, pasted)).toBe("80 characters pasted");
  });

  it("estimates time left", () => {
    expect(timeLeftLabel(0)).toMatch(/^About \d+ min left$/);
    expect(timeLeftLabel(REVIEW_INDEX)).toBe("Under a minute left");
  });
});

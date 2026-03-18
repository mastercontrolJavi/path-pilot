import { describe, it, expect } from "vitest";
import { buildAnalysisPrompt, SYSTEM_PROMPT } from "../prompts";
import type { QuestionnaireData } from "../schemas";

describe("SYSTEM_PROMPT", () => {
  it("contains key instructions", () => {
    expect(SYSTEM_PROMPT).toContain("elite early-career career strategist");
    expect(SYSTEM_PROMPT).toContain("exactly 3 career paths");
    expect(SYSTEM_PROMPT).toContain("strict JSON");
    expect(SYSTEM_PROMPT).toContain("NOT a resume writing task");
  });

  it("warns against generic traits", () => {
    expect(SYSTEM_PROMPT).toContain("hardworking");
    expect(SYSTEM_PROMPT).toContain("motivated");
  });
});

describe("buildAnalysisPrompt", () => {
  const mockQuestionnaire: QuestionnaireData = {
    preferred_work_style: ["Structured", "Analytical"],
    career_priorities: ["Growth", "Stability"],
    things_i_enjoy: "Organizing and problem-solving",
    things_i_dislike: "Repetitive admin tasks",
    past_experiences: "Marketing intern, club president",
    target_location: "London, UK",
    salary_goal: "£35k",
    biggest_current_problem: "I don't know what roles fit me",
    industries_of_interest: "Tech, Finance",
    hard_constraints: "Need visa sponsorship",
  };

  it("includes CV text in the prompt", () => {
    const prompt = buildAnalysisPrompt("My CV content here", mockQuestionnaire);
    expect(prompt).toContain("My CV content here");
  });

  it("includes all questionnaire fields", () => {
    const prompt = buildAnalysisPrompt("CV text", mockQuestionnaire);
    expect(prompt).toContain("Structured, Analytical");
    expect(prompt).toContain("Growth, Stability");
    expect(prompt).toContain("Organizing and problem-solving");
    expect(prompt).toContain("Repetitive admin tasks");
    expect(prompt).toContain("Marketing intern, club president");
    expect(prompt).toContain("London, UK");
    expect(prompt).toContain("£35k");
    expect(prompt).toContain("I don't know what roles fit me");
    expect(prompt).toContain("Tech, Finance");
    expect(prompt).toContain("Need visa sponsorship");
  });

  it("handles optional fields gracefully", () => {
    const minimal: QuestionnaireData = {
      ...mockQuestionnaire,
      salary_goal: undefined,
      industries_of_interest: undefined,
      hard_constraints: undefined,
    };
    const prompt = buildAnalysisPrompt("CV text", minimal);
    expect(prompt).toContain("Not specified");
    expect(prompt).toContain("None specified");
  });

  it("includes instructions for output format", () => {
    const prompt = buildAnalysisPrompt("CV text", mockQuestionnaire);
    expect(prompt).toContain("Exactly 3 strengths");
    expect(prompt).toContain("Exactly 3 realistic career paths");
    expect(prompt).toContain("7-day action plan");
  });
});

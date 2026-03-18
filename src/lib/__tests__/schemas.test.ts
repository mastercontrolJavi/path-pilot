import { describe, it, expect } from "vitest";
import {
  questionnaireSchema,
  analysisResultSchema,
  analyzeRequestSchema,
} from "../schemas";

describe("questionnaireSchema", () => {
  const validQuestionnaire = {
    preferred_work_style: ["Structured", "Analytical"],
    career_priorities: ["Growth", "Stability"],
    things_i_enjoy: "I enjoy organizing events and solving complex problems",
    things_i_dislike: "I dislike cold calling and repetitive admin tasks",
    past_experiences: "Marketing intern at a startup, led university club",
    target_location: "London, UK",
    salary_goal: "£30k+",
    biggest_current_problem:
      "I don't know what roles fit me and I'm applying everywhere",
    industries_of_interest: "Tech, Finance",
    hard_constraints: "Need visa sponsorship",
  };

  it("validates a correct questionnaire", () => {
    const result = questionnaireSchema.safeParse(validQuestionnaire);
    expect(result.success).toBe(true);
  });

  it("requires at least one work style", () => {
    const result = questionnaireSchema.safeParse({
      ...validQuestionnaire,
      preferred_work_style: [],
    });
    expect(result.success).toBe(false);
  });

  it("limits career priorities to max 3", () => {
    const result = questionnaireSchema.safeParse({
      ...validQuestionnaire,
      career_priorities: ["a", "b", "c", "d"],
    });
    expect(result.success).toBe(false);
  });

  it("requires minimum length for text fields", () => {
    const result = questionnaireSchema.safeParse({
      ...validQuestionnaire,
      things_i_enjoy: "short",
    });
    expect(result.success).toBe(false);
  });

  it("allows optional fields to be empty", () => {
    const result = questionnaireSchema.safeParse({
      ...validQuestionnaire,
      salary_goal: undefined,
      industries_of_interest: undefined,
      hard_constraints: undefined,
    });
    expect(result.success).toBe(true);
  });
});

describe("analysisResultSchema", () => {
  const validResult = {
    summary: "You are strongest in structured execution and analytical thinking.",
    strengths: [
      {
        name: "Operational Problem-Solving",
        score: 8,
        evidence: "Led process improvements at internship",
        why_it_matters: "Essential for operations and project management roles",
      },
      {
        name: "Analytical Communication",
        score: 7,
        evidence: "Created data reports for stakeholders",
        why_it_matters: "Valued in business analyst and consulting roles",
      },
      {
        name: "Cross-functional Coordination",
        score: 7,
        evidence: "Managed between marketing and engineering teams",
        why_it_matters: "Key skill for project coordinator roles",
      },
    ],
    career_paths: [
      {
        title: "Operations Analyst",
        fit_score: 85,
        why_it_fits: "Your structured approach and analytical skills align perfectly",
        why_it_is_realistic: "Entry-level positions widely available in London",
        example_job_titles: [
          "Operations Analyst",
          "Business Operations Associate",
          "Process Analyst",
          "Operations Coordinator",
          "Business Support Analyst",
        ],
        best_for: "Someone who likes structured problem-solving with data",
        tradeoff: "May involve repetitive reporting in early stages",
      },
      {
        title: "Project Coordinator",
        fit_score: 78,
        why_it_fits: "Your coordination experience and organized nature are ideal",
        why_it_is_realistic: "High demand across tech and consulting firms",
        example_job_titles: [
          "Project Coordinator",
          "Programme Assistant",
          "PMO Analyst",
          "Delivery Coordinator",
          "Implementation Coordinator",
        ],
        best_for: "Someone who thrives managing timelines and stakeholders",
        tradeoff: "Can be high-pressure with tight deadlines",
      },
      {
        title: "Business Analyst",
        fit_score: 72,
        why_it_fits: "Strong analytical skills with communication ability",
        why_it_is_realistic: "Growing demand, especially in financial services",
        example_job_titles: [
          "Junior Business Analyst",
          "Business Systems Analyst",
          "Requirements Analyst",
          "Data Analyst",
          "Insights Analyst",
        ],
        best_for: "Someone who enjoys translating data into business decisions",
        tradeoff: "May require additional SQL/Excel upskilling",
      },
    ],
    avoid_roles: [
      {
        role_type: "Pure Sales / BDR",
        reason: "You dislike cold calling and your strengths are analytical, not persuasive",
      },
      {
        role_type: "Highly Creative Roles",
        reason: "Your strengths lean structured/analytical rather than open-ended creative",
      },
    ],
    action_plan: [
      { step: 1, title: "Update LinkedIn headline", details: "Change to target Operations Analyst or Project Coordinator roles" },
      { step: 2, title: "Search for 10 matching roles", details: "Use the job titles above on LinkedIn and Indeed" },
      { step: 3, title: "Rewrite top 3 CV bullets", details: "Focus on quantified operational impact" },
      { step: 4, title: "Apply to 5 roles", details: "Prioritize Operations Analyst positions in London" },
      { step: 5, title: "Reach out to 2 people", details: "Message people in target roles on LinkedIn" },
      { step: 6, title: "Start a small proof-of-work project", details: "Create a process improvement case study" },
      { step: 7, title: "Reflect and adjust", details: "Review responses, refine applications based on feedback" },
    ],
    cv_rewrites: [
      {
        before: "Helped with various tasks in the marketing department",
        after: "Coordinated 3 cross-functional marketing campaigns, reducing delivery time by 20%",
        why_better: "Quantifies impact and shows coordination skills",
      },
      {
        before: "Responsible for data analysis",
        after: "Built weekly performance dashboards for 5 stakeholders, surfacing 3 actionable insights per report",
        why_better: "Shows scope, audience, and concrete output",
      },
    ],
    confidence_note:
      "This analysis is a decision-support tool based on the information you provided. Results are grounded in your CV and responses but should be treated as directional guidance. Iterate, explore, and adjust as you learn more.",
  };

  it("validates a correct analysis result", () => {
    const result = analysisResultSchema.safeParse(validResult);
    expect(result.success).toBe(true);
  });

  it("requires exactly 3 strengths", () => {
    const result = analysisResultSchema.safeParse({
      ...validResult,
      strengths: [validResult.strengths[0]],
    });
    expect(result.success).toBe(false);
  });

  it("requires exactly 3 career paths", () => {
    const result = analysisResultSchema.safeParse({
      ...validResult,
      career_paths: [validResult.career_paths[0]],
    });
    expect(result.success).toBe(false);
  });

  it("requires exactly 7 action plan steps", () => {
    const result = analysisResultSchema.safeParse({
      ...validResult,
      action_plan: [validResult.action_plan[0]],
    });
    expect(result.success).toBe(false);
  });

  it("requires fit scores between 1-100", () => {
    const result = analysisResultSchema.safeParse({
      ...validResult,
      career_paths: validResult.career_paths.map((p, i) =>
        i === 0 ? { ...p, fit_score: 150 } : p
      ),
    });
    expect(result.success).toBe(false);
  });

  it("requires strength scores between 1-10", () => {
    const result = analysisResultSchema.safeParse({
      ...validResult,
      strengths: validResult.strengths.map((s, i) =>
        i === 0 ? { ...s, score: 15 } : s
      ),
    });
    expect(result.success).toBe(false);
  });

  it("requires exactly 5 example job titles per path", () => {
    const result = analysisResultSchema.safeParse({
      ...validResult,
      career_paths: validResult.career_paths.map((p, i) =>
        i === 0 ? { ...p, example_job_titles: ["one", "two"] } : p
      ),
    });
    expect(result.success).toBe(false);
  });
});

describe("analyzeRequestSchema", () => {
  it("requires CV text of at least 50 characters", () => {
    const result = analyzeRequestSchema.safeParse({
      cvText: "too short",
      questionnaire: {
        preferred_work_style: ["Structured"],
        career_priorities: ["Growth"],
        things_i_enjoy: "I enjoy organizing events",
        things_i_dislike: "I dislike cold calling",
        past_experiences: "Intern at startup",
        target_location: "London",
        biggest_current_problem: "I don't know what to apply for",
      },
    });
    expect(result.success).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import {
  questionnaireSchema,
  analysisResultSchema,
  analyzeRequestSchema,
  careerPathSchema,
  isLegacyResult,
  normalizeAnalysisResult,
} from "../schemas";
import { sampleReport } from "../fixtures/sample-report";

describe("questionnaireSchema", () => {
  const validQuestionnaire = {
    education_status: "Have a degree, not currently pursuing further education",
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

  it("requires an education status selection", () => {
    const result = questionnaireSchema.safeParse({
      ...validQuestionnaire,
      education_status: "",
    });
    expect(result.success).toBe(false);
  });

  it("requires field of study and graduation timeframe when currently pursuing a degree", () => {
    const result = questionnaireSchema.safeParse({
      ...validQuestionnaire,
      education_status: "Currently pursuing a degree (in progress)",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toContain("field_of_study");
      expect(paths).toContain("expected_graduation");
    }
  });

  it("accepts a currently-pursuing education status once follow-up fields are filled", () => {
    const result = questionnaireSchema.safeParse({
      ...validQuestionnaire,
      education_status: "Currently pursuing a degree (in progress)",
      field_of_study: "Computer Science",
      expected_graduation: "Spring 2027",
    });
    expect(result.success).toBe(true);
  });

  it("requires write-in text when education status is Other", () => {
    const result = questionnaireSchema.safeParse({
      ...validQuestionnaire,
      education_status: "Other",
    });
    expect(result.success).toBe(false);
  });

  it("accepts an Other education status once the write-in text is filled", () => {
    const result = questionnaireSchema.safeParse({
      ...validQuestionnaire,
      education_status: "Other",
      education_status_other: "Trade school certification",
    });
    expect(result.success).toBe(true);
  });
});

describe("analysisResultSchema", () => {
  // Shape of reports generated before v2 (no pay or skills per path).
  const legacyResult = {
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

  const v2Extras = {
    salary_estimate: {
      currency: "GBP",
      low: 32000,
      high: 40000,
      period: "year" as const,
      basis: "Entry to mid-level, London, base salary",
    },
    skills_you_bring: ["Process improvement", "Stakeholder reporting"],
    skills_to_build: [{ skill: "SQL", effort: "weeks" as const, how: "Rebuild three reports on a public dataset" }],
  };

  const validResult = {
    ...legacyResult,
    career_paths: legacyResult.career_paths.map((p) => ({ ...p, ...v2Extras })),
  };

  it("rejects a legacy result under the v2 schema", () => {
    expect(analysisResultSchema.safeParse(legacyResult).success).toBe(false);
  });

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

describe("report v2 fields", () => {
  const path = {
    title: "Operations Analyst",
    fit_score: 85,
    why_it_fits: "Fits",
    why_it_is_realistic: "Realistic",
    example_job_titles: ["a", "b", "c", "d", "e"],
    best_for: "Someone",
    tradeoff: "Some",
    salary_estimate: { currency: "USD", low: 70000, high: 90000, period: "year", basis: "Mid-level, remote US" },
    skills_you_bring: ["Process mapping", "Reporting"],
    skills_to_build: [{ skill: "SQL", effort: "weeks", how: "Practice on a public dataset" }],
  };

  it("accepts a complete v2 career path", () => {
    expect(careerPathSchema.safeParse(path).success).toBe(true);
  });

  it("accepts a null salary estimate when the location is too vague", () => {
    expect(careerPathSchema.safeParse({ ...path, salary_estimate: null }).success).toBe(true);
  });

  it("requires the salary key to be present (strict structured outputs)", () => {
    const rest: Record<string, unknown> = { ...path };
    delete rest.salary_estimate;
    expect(careerPathSchema.safeParse(rest).success).toBe(false);
  });

  it("requires 2-6 transferable skills", () => {
    expect(careerPathSchema.safeParse({ ...path, skills_you_bring: ["Only one"] }).success).toBe(false);
  });

  it("only allows days, weeks or months as effort", () => {
    const bad = { ...path, skills_to_build: [{ skill: "SQL", effort: "years", how: "x" }] };
    expect(careerPathSchema.safeParse(bad).success).toBe(false);
  });
});

describe("sample report fixture", () => {
  it("matches the v2 schema the analysis produces", () => {
    const result = analysisResultSchema.safeParse(sampleReport);
    if (!result.success) console.error(result.error.issues);
    expect(result.success).toBe(true);
  });
});

describe("legacy reports", () => {
  const legacy = {
    summary: "s",
    strengths: [],
    career_paths: [
      { title: "Old path", fit_score: 70, why_it_fits: "", why_it_is_realistic: "", example_job_titles: [], best_for: "", tradeoff: "" },
    ],
    avoid_roles: [],
    action_plan: [],
    cv_rewrites: [],
    confidence_note: "",
  };

  it("detects reports without per-path skills", () => {
    expect(isLegacyResult(legacy)).toBe(true);
  });

  it("normalizes missing v2 fields to explicit empty values", () => {
    const normalized = normalizeAnalysisResult(legacy);
    expect(normalized.career_paths[0].salary_estimate).toBeNull();
    expect(normalized.career_paths[0].skills_you_bring).toEqual([]);
    expect(normalized.career_paths[0].skills_to_build).toEqual([]);
    expect(normalized.career_paths[0].title).toBe("Old path");
  });

  it("leaves v2 reports unchanged", () => {
    const v2 = {
      ...legacy,
      career_paths: [{ ...legacy.career_paths[0], salary_estimate: null, skills_you_bring: ["a", "b"], skills_to_build: [] }],
    };
    expect(isLegacyResult(v2)).toBe(false);
    expect(normalizeAnalysisResult(v2).career_paths[0].skills_you_bring).toEqual(["a", "b"]);
  });
});

describe("education_status", () => {
  const base = {
    preferred_work_style: ["Structured"],
    career_priorities: ["Growth"],
    things_i_enjoy: "I enjoy organizing events",
    things_i_dislike: "I dislike cold calling",
    past_experiences: "Six years in operations",
    target_location: "Remote",
    biggest_current_problem: "I can't tell where my experience transfers",
  };

  it("accepts every option the wizard offers", async () => {
    const { EDUCATION } = await import("../questionnaire-rules");
    for (const education_status of EDUCATION.options) {
      const extra =
        education_status === EDUCATION.other
          ? { education_status_other: "Bootcamp" }
          : education_status === EDUCATION.inProgress
            ? { field_of_study: "Design", expected_graduation: "Spring 2027" }
            : {};
      expect(questionnaireSchema.safeParse({ ...base, education_status, ...extra }).success).toBe(true);
    }
  });

  it("is required", () => {
    expect(questionnaireSchema.safeParse(base).success).toBe(false);
  });
});

describe("analyzeRequestSchema", () => {
  it("requires CV text of at least 50 characters", () => {
    const result = analyzeRequestSchema.safeParse({
      cvText: "too short",
      questionnaire: {
        education_status: "Some college, no degree",
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

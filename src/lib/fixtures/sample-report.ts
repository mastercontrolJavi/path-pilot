import type { AnalysisResult } from "@/lib/schemas";

/*
 * Illustrative sample report used on the landing page and /demo.
 * Not a real person. Pay figures are example estimates in the same shape the
 * analysis produces — always present them as a sample.
 */

export const sampleProfile = {
  role: "Operations coordinator",
  years: 6,
  location: "Remote, US",
} as const;

export const sampleReport: AnalysisResult = {
  summary:
    "Six years of operations coordination have made you the person who keeps handoffs from breaking: you run vendor schedules, close process gaps between teams, and turn messy requests into repeatable workflows. That is the core of product operations and implementation work, and it transfers more directly than your title suggests. The gap is less about ability than evidence: you need one or two results described in the language software teams hire for.",

  strengths: [
    {
      name: "Process design under pressure",
      score: 9,
      evidence:
        "Rebuilt the order-exception workflow across the warehouse and support teams, cutting average resolution time from 4 days to 1.5.",
      why_it_matters:
        "Product operations teams exist to remove exactly this kind of friction between functions. Few candidates can show it with numbers.",
    },
    {
      name: "Coordination without authority",
      score: 8,
      evidence:
        "Ran the weekly sync for 14 suppliers and three internal teams, and owned every escalation through to resolution.",
      why_it_matters:
        "Customer success and implementation roles depend on keeping several parties moving toward one date.",
    },
    {
      name: "Clear operational writing",
      score: 7,
      evidence:
        "Wrote the SOP library new hires were trained on, and the incident summaries leadership used in quarterly reviews.",
      why_it_matters:
        "Rollout notes, runbooks and requirements are a large part of these roles. Clear writing is a hiring signal.",
    },
  ],

  career_paths: [
    {
      title: "Product operations manager",
      fit_score: 87,
      why_it_fits:
        "You already do product ops work under a different name: mapping how requests move between teams, finding where they stall, and fixing the process rather than the symptom.",
      why_it_is_realistic:
        "Product ops hires often come from operations, support and implementation backgrounds. Your measured process wins are the evidence hiring managers look for.",
      example_job_titles: [
        "Product Operations Manager",
        "Product Operations Specialist",
        "Business Operations Manager",
        "Operations Program Manager",
        "Revenue Operations Specialist",
      ],
      best_for: "You, if you want to keep fixing systems but closer to a software product.",
      tradeoff:
        "Scope varies a lot between companies. At some it is mostly tooling and reporting, which may feel narrower than your current role.",
      salary_estimate: {
        currency: "USD",
        low: 95000,
        high: 125000,
        period: "year",
        basis: "Mid-level, remote US, base salary",
      },
      skills_you_bring: ["Process mapping", "Cross-team coordination", "SOP and runbook writing", "Operational metrics"],
      skills_to_build: [
        {
          skill: "SQL for operational reporting",
          effort: "weeks",
          how: "Rebuild one of your current weekly reports in SQL on a public dataset and share the queries.",
        },
        {
          skill: "Working inside product and engineering rituals",
          effort: "weeks",
          how: "Sit in on a product team's sprint planning, or write the requirements for an internal tool request.",
        },
        {
          skill: "Work-management tooling (Jira, Linear or Asana admin)",
          effort: "days",
          how: "Set up a sample workspace with intake forms and automations, and screenshot it for your portfolio.",
        },
      ],
    },
    {
      title: "Customer success manager",
      fit_score: 82,
      why_it_fits:
        "Your escalation handling and supplier relationships map directly onto keeping customers successful: you already manage expectations, unblock problems and follow through.",
      why_it_is_realistic:
        "SaaS companies regularly hire CSMs from operations and account coordination. The main gap is product fluency, which you can show within weeks.",
      example_job_titles: [
        "Customer Success Manager",
        "Client Success Manager",
        "Customer Success Associate",
        "Account Manager (Onboarding)",
        "Customer Operations Manager",
      ],
      best_for: "You, if you want more people contact and clear ownership of outcomes.",
      tradeoff:
        "Many CSM roles carry renewal or expansion targets. That is commercial work, even if it isn't cold outreach.",
      salary_estimate: {
        currency: "USD",
        low: 78000,
        high: 110000,
        period: "year",
        basis: "Mid-level, remote US, base salary before variable pay",
      },
      skills_you_bring: ["Escalation handling", "Stakeholder communication", "Follow-through on deadlines", "Process mapping"],
      skills_to_build: [
        {
          skill: "Account health metrics (churn, adoption, retention)",
          effort: "days",
          how: "Take a free customer success fundamentals course and apply its health score to a past supplier relationship.",
        },
        {
          skill: "SaaS product fluency",
          effort: "weeks",
          how: "Pick one tool you use daily, learn its admin features, and write a short onboarding guide for it.",
        },
        {
          skill: "Renewal and expansion conversations",
          effort: "months",
          how: "Practice with a mentor or a CS community mock call; ask for feedback on how you frame value.",
        },
      ],
    },
    {
      title: "Implementation specialist",
      fit_score: 79,
      why_it_fits:
        "Implementation is project coordination with a customer on the other side: timelines, checklists, handoffs and clear documentation, all of which you do now.",
      why_it_is_realistic:
        "It is one of the most common entry points into software companies for operations people, and it often leads to product ops or solutions roles later.",
      example_job_titles: [
        "Implementation Specialist",
        "Implementation Consultant",
        "Onboarding Specialist",
        "Implementation Project Coordinator",
        "Customer Onboarding Manager",
      ],
      best_for: "You, if you want a structured way into software with a clear next step after it.",
      tradeoff:
        "Pay starts lower than the other two routes, and busy launch periods can mean long weeks.",
      salary_estimate: {
        currency: "USD",
        low: 72000,
        high: 98000,
        period: "year",
        basis: "Mid-level, remote US, base salary",
      },
      skills_you_bring: ["Project coordination", "Checklists and SOPs", "Vendor onboarding", "Clear written updates"],
      skills_to_build: [
        {
          skill: "Data migration and CSV hygiene",
          effort: "days",
          how: "Clean and map a messy spreadsheet into a template, documenting each decision as you would for a client.",
        },
        {
          skill: "Basic integrations and APIs",
          effort: "weeks",
          how: "Connect two tools with a no-code automation and write up how the data moves.",
        },
      ],
    },
  ],

  avoid_roles: [
    {
      role_type: "Executive or office assistant roles",
      reason:
        "They use your coordination skills but usually pay less than you earn now and lead back to the work you want to leave.",
    },
    {
      role_type: "Quota-carrying sales",
      reason:
        "You said you want to avoid cold outreach. A customer success role is a gentler test of whether commercial work suits you.",
    },
  ],

  action_plan: [
    {
      step: 1,
      title: "Write your two strongest results",
      details:
        "Turn the order-exception rebuild and the supplier sync into two short paragraphs: the problem, what you changed, and the number that moved.",
    },
    {
      step: 2,
      title: "Collect 10 real job posts",
      details:
        "Save ten product operations and implementation listings. Highlight every requirement you already meet, and circle the ones you don't.",
    },
    {
      step: 3,
      title: "Rename your experience",
      details:
        "Rewrite your headline and top three CV bullets using the words from those listings, such as cross-functional, workflow and rollout.",
    },
    {
      step: 4,
      title: "Start one visible skill",
      details: "Begin the SQL reporting exercise. Aim for one finished query you can explain, not a course certificate.",
    },
    {
      step: 5,
      title: "Message three people who made this move",
      details:
        "Find people who went from operations to product ops or implementation. Ask one question: what made the hiring manager say yes?",
    },
    {
      step: 6,
      title: "Apply to three roles",
      details:
        "Pick the three listings where you meet the most requirements. Tailor the first two CV bullets for each; send them today.",
    },
    {
      step: 7,
      title: "Review and choose a lead route",
      details:
        "Look at which conversations and applications got traction. Pick one route to focus on for the next month.",
    },
  ],

  cv_rewrites: [
    {
      before: "Responsible for managing order exceptions and coordinating with the warehouse team.",
      after:
        "Redesigned the order-exception workflow across warehouse and support, cutting average resolution time from 4 days to 1.5.",
      why_better: "It leads with the change you made and the result, which is what product ops hiring managers scan for.",
    },
    {
      before: "Point of contact for suppliers.",
      after:
        "Ran a weekly operating rhythm for 14 suppliers and 3 internal teams, owning escalations through to resolution.",
      why_better: "It shows scale and ownership, which reads as customer success and implementation experience.",
    },
  ],

  confidence_note:
    "This is decision support, not a verdict. Pay figures are estimates for remote US roles at mid level, not live market data, so check them against current listings. Fit scores reflect how directly the evidence in your CV maps to each role.",
};

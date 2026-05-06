export type QuestionType = "single-select" | "multi-select" | "text";

export interface QuestionDefinition {
  id: string;
  fieldName: string;
  label: string;
  description: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  required: boolean;
  maxSelections?: number;
}

export const QUESTIONS: QuestionDefinition[] = [
  {
    id: "q1",
    fieldName: "preferred_work_style",
    label: "How do you prefer to work?",
    description: "Select all that resonate with you.",
    type: "multi-select",
    options: [
      "Structured",
      "Creative",
      "Analytical",
      "People-focused",
      "Hands-on",
      "Independent",
      "Fast-paced",
      "Mission-driven",
    ],
    required: true,
  },
  {
    id: "q2",
    fieldName: "career_priorities",
    label: "What matters most in your career?",
    description: "Pick up to 3 priorities.",
    type: "multi-select",
    options: [
      "High income",
      "Stability",
      "Work-life balance",
      "Remote flexibility",
      "Growth",
      "Meaningful work",
      "Prestige",
      "Creativity",
    ],
    required: true,
    maxSelections: 3,
  },
  {
    id: "q3",
    fieldName: "things_i_enjoy",
    label: "What do you genuinely enjoy doing?",
    description: "Think about tasks, projects, or activities that energize you.",
    type: "text",
    placeholder: "e.g., I love organizing events, solving puzzles, writing, analyzing data...",
    required: true,
  },
  {
    id: "q4",
    fieldName: "things_i_dislike",
    label: "What do you want to avoid in a job?",
    description: "Be honest about dealbreakers and energy drains.",
    type: "text",
    placeholder: "e.g., Cold calling, repetitive data entry, working alone all day...",
    required: true,
  },
  {
    id: "q5",
    fieldName: "past_experiences",
    label: "Summarize your key experiences",
    description: "Internships, projects, leadership roles, freelance work, anything relevant.",
    type: "text",
    placeholder: "e.g., Marketing intern at a startup, led a university club, freelance design work...",
    required: true,
  },
  {
    id: "q6",
    fieldName: "target_location",
    label: "Where do you want to work?",
    description: "City, country, or remote preference.",
    type: "text",
    placeholder: "e.g., London, Remote, US East Coast, Hybrid in NYC...",
    required: true,
  },
  {
    id: "q7",
    fieldName: "salary_goal",
    label: "What's your salary expectation?",
    description: "Optional but helps us recommend realistic paths.",
    type: "text",
    placeholder: "e.g., $50-60k, \u00a330k+, Open to lower for the right role...",
    required: false,
  },
  {
    id: "q8",
    fieldName: "biggest_current_problem",
    label: "What's your biggest career frustration right now?",
    description: "What made you try this tool today?",
    type: "text",
    placeholder: "e.g., I don't know what roles fit me, I'm applying everywhere and hearing nothing...",
    required: true,
  },
  {
    id: "q9",
    fieldName: "industries_of_interest",
    label: "Any industries you're drawn to?",
    description: "Optional. List industries or sectors that interest you.",
    type: "text",
    placeholder: "e.g., Tech, Healthcare, Finance, Education, Sustainability...",
    required: false,
  },
  {
    id: "q10",
    fieldName: "hard_constraints",
    label: "Any hard constraints we should know about?",
    description: "Optional. Visa requirements, location limits, things you absolutely can't do.",
    type: "text",
    placeholder: "e.g., Need visa sponsorship, can't relocate, no sales roles...",
    required: false,
  },
];

export const LOADING_MESSAGES = [
  "Reading your CV...",
  "Identifying your real strengths...",
  "Mapping realistic career paths...",
  "Analyzing your preferences...",
  "Finding roles that actually fit...",
  "Building your 7-day action plan...",
  "Crafting CV improvements...",
  "Finalizing your report...",
];

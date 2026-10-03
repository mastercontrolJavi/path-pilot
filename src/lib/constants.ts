import type { QuestionnaireData } from "./schemas";
import { EDUCATION } from "./questionnaire-rules";

export type QuestionType = "single-select" | "multi-select" | "text";

export interface QuestionDefinition {
  id: string;
  /** Key in the stored questionnaire. Never rename: stored reports depend on it. */
  fieldName: keyof QuestionnaireData;
  label: string;
  /** Why we ask, in 15 words or fewer. */
  description: string;
  /** Label on the wizard's path rail. */
  short: string;
  type: QuestionType;
  /** Multi-select options; the label is also the stored value. */
  options?: string[];
  /** Single-select choices: stored value plus the label people see. */
  choices?: { value: string; label: string }[];
  placeholder?: string;
  required: boolean;
  maxSelections?: number;
  /** Text answers that need room (textarea) rather than a single line. */
  multiline?: boolean;
  /** Extra required inputs shown under a single choice when it is picked. */
  followUps?: { when: string; fields: FollowUpField[] }[];
}

export type FollowUpField = {
  name: "education_status_other" | "field_of_study" | "expected_graduation";
  label: string;
  placeholder: string;
  /** Shown when the field is left empty. */
  message: string;
};

export const QUESTIONS: QuestionDefinition[] = [
  {
    id: "q1",
    fieldName: "preferred_work_style",
    label: "How do you like to work?",
    description: "Pick all that fit. We rule out roles that would drain you.",
    short: "How you work",
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
    label: "What matters most in your next role?",
    description: "Pick up to three. Every route is weighed against them.",
    short: "What matters",
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
    label: "What work do you genuinely enjoy?",
    description: "The tasks that give you energy point to roles that will.",
    short: "What you enjoy",
    type: "text",
    multiline: true,
    placeholder: "e.g. untangling messy processes, training new people, digging into the numbers",
    required: true,
  },
  {
    id: "q4",
    fieldName: "things_i_dislike",
    label: "What do you want to leave behind?",
    description: "So we don't route you straight back into it.",
    short: "What to avoid",
    type: "text",
    multiline: true,
    placeholder: "e.g. cold calling, night shifts, being the only one who fixes everything",
    required: true,
  },
  {
    id: "q5",
    fieldName: "past_experiences",
    label: "What experience should we know about?",
    description: "Anything your CV undersells: projects, side work, responsibilities you took on.",
    short: "Experience",
    type: "text",
    multiline: true,
    placeholder: "e.g. onboarded 14 suppliers, trained every new hire, built our weekly reporting",
    required: true,
  },
  {
    id: "q_education",
    fieldName: "education_status",
    label: "What's your education status?",
    description: "Some routes expect a degree; many hire on proven skill.",
    short: "Education",
    type: "single-select",
    // Stored values match production (PR #17); the option text is the value.
    choices: EDUCATION.options.map((option) => ({ value: option, label: option })),
    followUps: [
      {
        when: EDUCATION.other,
        fields: [
          {
            name: "education_status_other",
            label: "Tell us more",
            placeholder: "e.g. bootcamp graduate, professional certification, still deciding",
            message: EDUCATION.messages.other,
          },
        ],
      },
      {
        when: EDUCATION.inProgress,
        fields: [
          { name: "field_of_study", label: "Field of study", placeholder: "e.g. Computer Science", message: EDUCATION.messages.fieldOfStudy },
          { name: "expected_graduation", label: "Expected graduation", placeholder: "e.g. Spring 2027", message: EDUCATION.messages.graduation },
        ],
      },
    ],
    required: true,
  },
  {
    id: "q6",
    fieldName: "target_location",
    label: "Where do you want to work?",
    description: "Pay and openings depend on the place.",
    short: "Location",
    type: "text",
    placeholder: "e.g. Remote US, London, hybrid in Austin",
    required: true,
  },
  {
    id: "q7",
    fieldName: "salary_goal",
    label: "What do you want to earn?",
    description: "Optional. Helps us flag routes that would pay too little.",
    short: "Pay goal",
    type: "text",
    placeholder: "e.g. $85k+, £45k, open for the right role",
    required: false,
  },
  {
    id: "q8",
    fieldName: "biggest_current_problem",
    label: "What's making this hard right now?",
    description: "Your report starts from the problem you actually have.",
    short: "What's hard",
    type: "text",
    multiline: true,
    placeholder: "e.g. I know I want out, but I can't tell where my experience transfers",
    required: true,
  },
  {
    id: "q9",
    fieldName: "industries_of_interest",
    label: "Any industries you're drawn to?",
    description: "Optional. We lean toward these when routes are close.",
    short: "Industries",
    type: "text",
    placeholder: "e.g. software, healthcare, climate, education",
    required: false,
  },
  {
    id: "q10",
    fieldName: "hard_constraints",
    label: "Anything we must work around?",
    description: "Optional. Visas, location limits, hours, or roles you won't consider.",
    short: "Constraints",
    type: "text",
    multiline: true,
    placeholder: "e.g. need visa sponsorship, can't relocate, no sales roles",
    required: false,
  },
];

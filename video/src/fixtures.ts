/** Fixture persona (brief §4). Illustrative only: never presented as real statistics. */
export const persona = {
  current: "Operations coordinator · 6 yrs",
  cvFile: "maria-reyes-cv.pdf",
  cvSize: "214 KB",
};

export const destinations = [
  { title: "Product operations manager", fit: 87, low: 95_000, high: 125_000 },
  { title: "Customer success manager", fit: 82, low: 78_000, high: 110_000 },
  { title: "Implementation specialist", fit: 79, low: 72_000, high: 98_000 },
] as const;

export const youBring = ["Process design", "Vendor management", "SQL basics", "Stakeholder communication", "Forecasting"];

/** The app labels effort as days / weeks / months ("A few weeks"), not exact durations. */
export const toBuild = [
  { skill: "Product analytics", effort: "A few weeks" },
  { skill: "Roadmap tooling", effort: "A few days" },
  { skill: "Experiment design", effort: "A few weeks" },
];

export const railSteps = [
  "Your CV", "How you work", "What matters", "What you enjoy", "What to avoid", "Experience",
  "Education", "Location", "Pay goal", "What's hard", "Industries", "Constraints", "Review",
];

/** Scene 2: what people search instead. */
export const tabs = [
  "what jobs can I do with operations experience",
  "product ops salary remote",
  "transferable skills list",
  "I'm 31 and stuck : r/careerguidance",
  "is a bootcamp worth it",
  "customer success vs project manager",
  "how to change careers at 30",
  "operations coordinator next step",
  "career change without a degree",
  "remote jobs that pay $90k",
  "what is product operations",
  "implementation specialist salary",
  "how to rewrite resume for career change",
  "skills employers want 2026",
  "jobs similar to operations manager",
  "is customer success a good career",
  "best certifications for career changers",
  "how long does a career change take",
  "salary negotiation career change",
  "entry level product jobs remote",
  "cover letter for career change",
  "am I too old to switch careers",
  "jobs for organized people",
  "how to explain a career change",
  "SQL for beginners free course",
  "project manager vs product manager",
  "career quiz what should I do",
  "how to get into tech without coding",
  "operations to product manager reddit",
  "remote hybrid jobs near me",
  "LinkedIn headline career change",
  "highest paying non tech jobs",
  "should I quit my job without a plan",
  "how to find transferable skills",
  "what do vendor managers earn",
  "informational interview questions",
  "job boards for career changers",
  "is a master's degree worth it",
  "customer success interview questions",
  "how to network when switching careers",
];

export const statements = {
  fog: "Changing careers usually means forty tabs.",
  route: "PathPilot gives you one route.",
  caption7: "See where you fit, what it pays, and what to build.",
  tagline: "Know where your experience can take you.",
  url: "pathpilot.javiertpadilla.com",
};

export const formatK = (n: number) => `$${Math.round(n / 1000)}k`;

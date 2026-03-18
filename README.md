# PathPilot

A career decision and execution system for early-career professionals. PathPilot helps users understand their real strengths, recommends exactly 3 realistic career paths, and provides a concrete 7-day action plan.

**This is not a resume builder.** It's a tool that reduces career confusion and turns overwhelm into clear, actionable steps.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui
- **Supabase** — Auth, Postgres, Storage
- **OpenAI API** (GPT-4o) via Vercel AI SDK
- **Zod** for validation
- **React Hook Form** for forms
- **pdf-parse** for PDF text extraction
- **Framer Motion** for transitions

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project
- An OpenAI API key

### 1. Clone and install

```bash
git clone <repo-url>
cd pathpilot
npm install
```

### 2. Set up environment variables

Copy the example env file:

```bash
cp .env.local.example .env.local
```

Fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Set up Supabase

Run the migration SQL in your Supabase SQL editor:

```bash
# The migration file is at:
supabase/migrations/001_initial.sql
```

This creates:
- `profiles` table with auto-creation trigger on signup
- `analyses` table for storing career analyses
- `analysis_feedback` table for user feedback
- Row-Level Security policies on all tables
- Required indexes

**Storage setup:**
1. Go to Supabase Dashboard > Storage
2. Create a new bucket called `cv-uploads`
3. Set it to **private**
4. Add a storage policy: authenticated users can upload to and read from the bucket

**Auth setup:**
1. Go to Supabase Dashboard > Authentication > Settings
2. Enable Email/Password sign-in
3. Set the Site URL to your deployment URL (e.g., `http://localhost:3000` for local dev)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. **Sign up** with email and password
2. **Upload your CV** (PDF) or paste CV text
3. **Answer 10 guided questions** about work style, priorities, and constraints
4. **Get your analysis** — the AI returns:
   - A personal summary
   - Top 3 strengths with evidence
   - 3 realistic career paths with fit scores
   - Roles to avoid
   - A concrete 7-day action plan
   - CV bullet rewrites
5. **Revisit past analyses** from your dashboard

## Deploying to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add the environment variables from `.env.local.example`
4. Deploy

**Important:** The OpenAI analysis call takes 15-30 seconds. On Vercel Pro, the default function timeout is 60 seconds which is sufficient. On Vercel Hobby (10s timeout), the async pattern handles this gracefully — the API returns immediately and the client polls for results.

## Project Structure

```
src/
  app/
    (marketing)/page.tsx      — Landing page
    (auth)/login, signup      — Auth pages
    (app)/dashboard           — Analysis history
    (app)/new                 — CV upload + questionnaire wizard
    (app)/analysis/[id]       — Results page
    api/analyze/              — Analysis API routes
  components/
    analysis/                 — Results section components
    forms/                    — Form components
    layout/                   — App header
    ui/                       — shadcn/ui components
  lib/
    supabase/                 — Supabase client setup
    schemas.ts                — Zod validation schemas
    prompts.ts                — AI system prompt + builder
    openai.ts                 — OpenAI client setup
    pdf.ts                    — PDF text extraction
    constants.ts              — Question definitions
```

## Notes

- **PDF parsing**: Uses `pdf-parse` v2 for server-side text extraction. Scanned/image PDFs won't extract text — users should paste text instead.
- **OpenAI model**: Defaults to `gpt-4o`. Set `OPENAI_MODEL` env var to use a different model (e.g., `gpt-4o-mini` for lower cost).
- **Rate limiting**: Not implemented in MVP. Consider adding for production use.

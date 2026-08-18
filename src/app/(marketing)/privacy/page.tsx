import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - PathPilot",
  description: "How PathPilot collects, uses, and protects your data.",
};

const LAST_UPDATED = "August 18, 2026";
const CONTACT_EMAIL = "jvra0102@gmail.com";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <div className="space-y-10 text-sm leading-relaxed text-foreground/90">
        <section>
          <p>
            PathPilot (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is an
            independent project built and operated by Javier Padilla. This
            policy explains what information PathPilot collects when you use
            the app, why we collect it, who we share it with, and the choices
            you have. We&apos;ve tried to write it in plain language rather
            than legal boilerplate.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            1. Information we collect
          </h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-1">Account information</p>
              <p className="text-muted-foreground">
                When you sign up, we collect your email address, your name
                (if provided), and a securely hashed password, handled by our
                authentication provider, Supabase.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Your CV and questionnaire responses</p>
              <p className="text-muted-foreground">
                When you request an analysis, we collect either the PDF file
                you upload or the text you paste, along with your answers to
                our questionnaire (work style, priorities, target location,
                salary expectations, and similar details you choose to
                share).
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Analysis results and feedback</p>
              <p className="text-muted-foreground">
                We store the career analysis generated for you so you can
                revisit it later, and any optional feedback you submit about
                whether an analysis was helpful.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">What we don&apos;t collect</p>
              <p className="text-muted-foreground">
                PathPilot does not currently use analytics tools, advertising
                trackers, or third-party cookies. We don&apos;t know which
                pages you visited before signing up, and we&apos;re not
                building an ad profile of you.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            2. How we use your information
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>To generate your career analysis and action plan</li>
            <li>To let you log in and view your analysis history</li>
            <li>To respond if you contact us with a question or an issue</li>
            <li>
              To improve PathPilot&apos;s prompts and question set, using
              aggregated feedback rather than reviewing individual CVs
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            3. Who we share it with
          </h2>
          <p className="text-muted-foreground mb-3">
            We use a small number of third-party services to run PathPilot.
            We don&apos;t sell your data, and we don&apos;t share it with
            advertisers.
          </p>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-1">OpenAI</p>
              <p className="text-muted-foreground">
                Your CV text and questionnaire answers are sent to OpenAI&apos;s
                API to generate your analysis. OpenAI processes this data to
                return a result to us and, per their API data usage policies,
                does not use API content to train their models by default.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Supabase</p>
              <p className="text-muted-foreground">
                Supabase hosts our database, handles authentication, and
                stores uploaded CV files. Your data is encrypted in transit
                and access is restricted to your own account through
                row-level security.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            4. Data retention
          </h2>
          <p className="text-muted-foreground">
            We keep your account information, CVs, and analyses for as long
            as your account is active. If you delete your account, we
            permanently delete your CV files, questionnaire responses, and
            analysis history within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            5. Your rights and choices
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>
              <span className="text-foreground">Access:</span> your dashboard
              shows every analysis tied to your account.
            </li>
            <li>
              <span className="text-foreground">Deletion:</span> email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 hover:text-foreground">
                {CONTACT_EMAIL}
              </a>{" "}
              to request full deletion of your account and data.
            </li>
            <li>
              <span className="text-foreground">Correction:</span> you can
              re-run an analysis at any time with updated information.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            6. Security
          </h2>
          <p className="text-muted-foreground">
            We rely on Supabase&apos;s infrastructure for encryption at rest
            and in transit, and we restrict data access using row-level
            security so that users can only ever read their own records. No
            system is perfectly secure, and we can&apos;t guarantee absolute
            protection against every threat.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            7. Children&apos;s privacy
          </h2>
          <p className="text-muted-foreground">
            PathPilot is not directed at, and should not be used by, anyone
            under 16 years old. We do not knowingly collect information from
            children under 16.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            8. International users
          </h2>
          <p className="text-muted-foreground">
            PathPilot is operated as an independent project. If you access it
            from outside the country where it&apos;s hosted, your information
            will be processed there. By using PathPilot, you consent to this
            transfer and processing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            9. Changes to this policy
          </h2>
          <p className="text-muted-foreground">
            If we make material changes to this policy, we&apos;ll update the
            date at the top of this page. Continued use of PathPilot after a
            change means you accept the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            10. Contact us
          </h2>
          <p className="text-muted-foreground">
            Questions about this policy or your data? Reach out at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 hover:text-foreground">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-16 pt-8 border-t border-border/50">
        <Link
          href="/terms"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Read our Terms of Service →
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { CONTACT_EMAIL } from "@/config/site";

export const metadata = {
  title: "Privacy Policy - PathPilot",
  description: "How PathPilot collects, uses, and protects your data.",
};

const LAST_UPDATED = "October 2, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-text px-4 py-16 sm:px-6 md:py-24">
      <div className="mb-12">
        <h1 className="mb-3 font-display text-2xl font-[400] tracking-[-0.015em] text-ink md:text-3xl">
          Privacy Policy
        </h1>
        <p className="text-sm text-ink-muted">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <div className="space-y-12 text-base leading-relaxed text-ink">
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
          <h2 className="mb-3 font-display text-xl font-[420] text-ink">
            1. Information we collect
          </h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-1">Account information</p>
              <p className="text-ink-muted">
                When you sign up, we collect your email address, your name
                (if provided), and a securely hashed password, handled by our
                authentication provider, Supabase.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Your CV and questionnaire responses</p>
              <p className="text-ink-muted">
                When you request an analysis, we collect either the PDF file
                you upload or the text you paste, along with your answers to
                our questionnaire (work style, priorities, target location,
                salary expectations, and similar details you choose to
                share).
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Analysis results and feedback</p>
              <p className="text-ink-muted">
                We store the career analysis generated for you so you can
                revisit it later, and any optional feedback you submit about
                whether an analysis was helpful.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Page analytics</p>
              <p className="text-ink-muted">
                We use Vercel Web Analytics to count page views. It doesn&apos;t
                use cookies, and it reports aggregated figures such as which
                pages are visited, the referring site, and the country and
                device type, not a profile of you.
                {/* COPY-CHECK: matches Vercel Web Analytics as configured (no custom events are sent today). */}
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Saved in your browser</p>
              <p className="text-ink-muted">
                While you answer the questions, your answers are saved in your
                own browser so you can pick up where you left off, and the
                check marks on your plan are saved there too. They stay on
                your device; you can clear them from your account menu or by
                clearing this site&apos;s data. Your CV is never saved there.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">What we don&apos;t collect</p>
              <p className="text-ink-muted">
                PathPilot doesn&apos;t use advertising trackers or third-party
                cookies, and we&apos;re not building an ad profile of you.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-[420] text-ink">
            2. How we use your information
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-ink-muted">
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
          <h2 className="mb-3 font-display text-xl font-[420] text-ink">
            3. Who we share it with
          </h2>
          <p className="text-ink-muted mb-3">
            We use a small number of third-party services to run PathPilot.
            We don&apos;t sell your data, and we don&apos;t share it with
            advertisers.
          </p>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-1">OpenAI</p>
              <p className="text-ink-muted">
                Your CV text and questionnaire answers are sent to OpenAI&apos;s
                API to generate your analysis. OpenAI processes this data to
                return a result to us and, per their API data usage policies,
                does not use API content to train their models by default.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Supabase</p>
              <p className="text-ink-muted">
                Supabase hosts our database, handles authentication, and
                stores uploaded CV files. Your data is encrypted in transit
                and access is restricted to your own account through
                row-level security.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-[420] text-ink">
            4. Data retention
          </h2>
          <p className="text-ink-muted">
            We keep your account information, CVs, and analyses for as long
            as your account is active. If you delete your account, we
            permanently delete your CV files, questionnaire responses, and
            analysis history within 30 days.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-[420] text-ink">
            5. Your rights and choices
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-ink-muted">
            <li>
              <span className="text-ink">Access:</span> your dashboard
              shows every analysis tied to your account.
            </li>
            <li>
              <span className="text-ink">Deletion:</span> email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-forest">
                {CONTACT_EMAIL}
              </a>{" "}
              to request full deletion of your account and data.
            </li>
            <li>
              <span className="text-ink">Correction:</span> you can
              re-run an analysis at any time with updated information.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-[420] text-ink">
            6. Security
          </h2>
          <p className="text-ink-muted">
            We rely on Supabase&apos;s infrastructure for encryption at rest
            and in transit, and we restrict data access using row-level
            security so that users can only ever read their own records. No
            system is perfectly secure, and we can&apos;t guarantee absolute
            protection against every threat.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-[420] text-ink">
            7. Children&apos;s privacy
          </h2>
          <p className="text-ink-muted">
            PathPilot is not directed at, and should not be used by, anyone
            under 16 years old. We do not knowingly collect information from
            children under 16.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-[420] text-ink">
            8. International users
          </h2>
          <p className="text-ink-muted">
            PathPilot is operated as an independent project. If you access it
            from outside the country where it&apos;s hosted, your information
            will be processed there. By using PathPilot, you consent to this
            transfer and processing.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-[420] text-ink">
            9. Changes to this policy
          </h2>
          <p className="text-ink-muted">
            If we make material changes to this policy, we&apos;ll update the
            date at the top of this page. Continued use of PathPilot after a
            change means you accept the updated policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-[420] text-ink">
            10. Contact us
          </h2>
          <p className="text-ink-muted">
            Questions about this policy or your data? Reach out at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-forest">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-16 border-t border-contour pt-8">
        <Link
          href="/terms"
          className="rounded-control text-base font-medium text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-forest"
        >
          Read the Terms of Service
        </Link>
      </div>
    </div>
  );
}

import { WizardPreview } from "./preview";

export const metadata = { title: "Wizard preview - PathPilot" };

/** Internal: the wizard and sign-up confirmation without an account (local and preview deploys only). */
export default function WizardPreviewPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <WizardPreview />
    </div>
  );
}

import type { AnalysisResult } from "@/lib/schemas";
import { AlertTriangle } from "lucide-react";

export function AvoidRolesSection({
  roles,
}: {
  roles: AnalysisResult["avoid_roles"];
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-foreground/70" />
        <h2 className="text-lg font-semibold tracking-tight">
          Roles to avoid
        </h2>
      </div>
      <div className="bg-white rounded-2xl border border-border/50 divide-y divide-border/50">
        {roles.map((role) => (
          <div key={role.role_type} className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">{role.role_type}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {role.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

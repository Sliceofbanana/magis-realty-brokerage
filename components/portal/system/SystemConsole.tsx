"use client";

import { PageHeader } from "@/components/portal/PageHeader";
import { SystemSettingsView } from "@/components/portal/SystemSettingsView";
import { Tabs } from "@/components/ui/Tabs";
import type { SystemOverview } from "@/lib/actions/system";
import { AuditPanel } from "./AuditPanel";
import { DataPanel } from "./DataPanel";
import { HealthPanel } from "./HealthPanel";
import { IntegrationsPanel } from "./IntegrationsPanel";
import { NotificationsPanel } from "./NotificationsPanel";
import { GeneralPanel, WorkflowPanel } from "./ReferencePanels";
import { SecurityPanel } from "./SecurityPanel";

// No icons: nine labelled tabs fit the desktop width, and a clipped last tab hides a whole section.
const tabs = [
  { id: "controls", label: "Controls" },
  { id: "general", label: "General" },
  { id: "workflow", label: "Workflow" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "audit", label: "Audit log" },
  { id: "data", label: "Data" },
  { id: "integrations", label: "Integrations" },
  { id: "health", label: "Health" },
];

/**
 * The System Admin console. Each tab fetches its own data the first time it's
 * opened. Controls stays mounted (just hidden) so unsaved switch changes
 * survive a look at another tab.
 */
export function SystemConsole({ overview }: { overview: SystemOverview }) {
  return (
    <div>
      <PageHeader
        title="System"
        description="Platform controls for System Admins: maintenance, security, audit, data, integrations and health."
      />
      <Tabs tabs={tabs}>
        {(active) => (
          <>
            <div hidden={active !== "controls"}>
              <SystemSettingsView overview={overview} />
            </div>
            {active === "general" && <GeneralPanel />}
            {active === "workflow" && <WorkflowPanel />}
            {active === "notifications" && <NotificationsPanel />}
            {active === "security" && <SecurityPanel />}
            {active === "audit" && <AuditPanel />}
            {active === "data" && <DataPanel />}
            {active === "integrations" && <IntegrationsPanel />}
            {active === "health" && <HealthPanel />}
          </>
        )}
      </Tabs>
    </div>
  );
}

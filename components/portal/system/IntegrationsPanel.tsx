"use client";

import { Plug } from "lucide-react";
import { getIntegrationsAction, type IntegrationState } from "@/lib/actions/systemInsights";
import { LoaderGate, Notice, Pill, RefreshButton, useLoader, type Tone } from "./ui";

const stateView: Record<IntegrationState, { tone: Tone; label: string }> = {
  connected: { tone: "good", label: "Connected" },
  configured: { tone: "good", label: "Configured" },
  "not-configured": { tone: "neutral", label: "Not configured" },
  error: { tone: "bad", label: "Problem" },
  fallback: { tone: "warn", label: "Fallback" },
  paused: { tone: "warn", label: "Paused" },
};

export function IntegrationsPanel() {
  const loader = useLoader(getIntegrationsAction);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {loader.data ? `Checked ${loader.data.checkedAt} (Manila time).` : "Checking each service…"}
        </p>
        <RefreshButton loader={loader} label="Check again" />
      </div>
      <LoaderGate loader={loader}>
        {(data) => (
          <>
            <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {data.rows.map((row) => {
                const view = stateView[row.state];
                return (
                  <li key={row.name} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-navy-700">
                          <Plug size={18} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <h2 className="font-serif text-lg font-bold text-navy-900">{row.name}</h2>
                          <p className="text-xs text-gray-500">{row.purpose}</p>
                        </div>
                      </div>
                      <Pill tone={view.tone}>{view.label}</Pill>
                    </div>
                    <p className="mt-4 text-sm text-navy-900">{row.detail}</p>
                    {row.hint && <p className="mt-1 text-sm text-gray-500">{row.hint}</p>}
                  </li>
                );
              })}
            </ul>
            <Notice>
              A status only says whether the credentials are set and, where possible, whether the service answers. No keys are shown
              here. API keys and webhooks aren&rsquo;t part of the portal today, so there&rsquo;s nothing to manage for them.
            </Notice>
          </>
        )}
      </LoaderGate>
    </div>
  );
}

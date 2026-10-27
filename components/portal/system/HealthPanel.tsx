"use client";

import { Activity, Database, HardDrive, Server, Wrench } from "lucide-react";
import { getHealthReportAction } from "@/lib/actions/systemInsights";
import { Card, LoaderGate, Notice, Pill, RefreshButton, Rows, formatBytes, useLoader } from "./ui";

export function HealthPanel() {
  const loader = useLoader(getHealthReportAction);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {loader.data ? `Checked ${loader.data.checkedAt} (Manila time).` : "Checking…"}
        </p>
        <RefreshButton loader={loader} />
      </div>
      <LoaderGate loader={loader}>
        {(d) => {
          const slow = d.database.ok && (d.database.latencyMs ?? 0) > 1000;
          return (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Application", pill: <Pill tone="good">Running</Pill> },
                  {
                    label: "Database",
                    pill: d.database.ok ? <Pill tone={slow ? "warn" : "good"}>{slow ? "Slow" : "Connected"}</Pill> : <Pill tone="bad">Unreachable</Pill>,
                  },
                  {
                    label: "Portal and website",
                    pill: d.offline.length === 0 ? <Pill tone="good">All online</Pill> : <Pill tone="warn">{d.offline.length} under maintenance</Pill>,
                  },
                  { label: "Last recorded activity", pill: <span className="text-sm font-semibold text-navy-900">{d.lastEventAt ?? "None yet"}</span> },
                ].map((tile) => (
                  <div key={tile.label} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{tile.label}</p>
                    <div className="mt-2">{tile.pill}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <Card icon={<Server size={18} />} title="Application" description="What's running right now.">
                  <Rows
                    rows={[
                      { label: "Version", value: d.app.version },
                      { label: "Build", value: d.app.commit ? <span className="font-mono">{d.app.commit}</span> : "Not a hosted build" },
                      { label: "Environment", value: d.app.environment },
                      { label: "Node.js", value: d.app.node },
                    ]}
                  />
                </Card>

                <Card icon={<Database size={18} />} title="Database" description="PostgreSQL.">
                  {d.database.ok ? (
                    <Rows
                      rows={[
                        { label: "Response time", value: `${d.database.latencyMs} ms` },
                        { label: "Size on disk", value: formatBytes(d.database.sizeBytes) },
                      ]}
                    />
                  ) : (
                    <Notice tone="bad">The database didn&rsquo;t answer: {d.database.error}</Notice>
                  )}
                  {slow && (
                    <div className="mt-4">
                      <Notice tone="warn">A response over a second is slow. If it stays that way, check the database host.</Notice>
                    </div>
                  )}
                </Card>

                <Card icon={<HardDrive size={18} />} title="Storage usage" description="Uploaded documents and photos.">
                  <Rows
                    rows={[
                      { label: "Documents in the portal", value: `${d.storage.documentCount.toLocaleString("en-PH")} · ${formatBytes(d.storage.documentBytes)}` },
                      ...(d.storage.cloud
                        ? [
                            { label: "Cloudinary plan", value: d.storage.cloud.plan ?? "—" },
                            { label: "Cloudinary storage used", value: formatBytes(d.storage.cloud.storageBytes) },
                            {
                              label: "Cloudinary credits used",
                              value: d.storage.cloud.creditsUsedPercent === null ? "—" : `${d.storage.cloud.creditsUsedPercent}%`,
                            },
                          ]
                        : []),
                    ]}
                  />
                  {d.storage.cloudError && (
                    <div className="mt-4">
                      <Notice tone="warn">Couldn&rsquo;t read Cloudinary&rsquo;s usage: {d.storage.cloudError}</Notice>
                    </div>
                  )}
                </Card>

                <Card icon={<Wrench size={18} />} title="Maintenance" description="Anything switched off right now.">
                  {d.offline.length === 0 ? (
                    <p className="text-sm text-gray-500">Nothing is under maintenance.</p>
                  ) : (
                    <ul className="flex flex-wrap gap-2">
                      {d.offline.map((name) => (
                        <li key={name}>
                          <Pill tone="warn">{name}</Pill>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>

              <Card icon={<Activity size={18} />} title="Background jobs and errors">
                <Notice>
                  The portal runs no scheduled or background jobs, so there&rsquo;s nothing to monitor there. It also doesn&rsquo;t collect error
                  logs itself: check your host&rsquo;s logs (for example Vercel, under Logs) for failures. Failing integrations show up under
                  Integrations.
                </Notice>
              </Card>
            </>
          );
        }}
      </LoaderGate>
    </div>
  );
}

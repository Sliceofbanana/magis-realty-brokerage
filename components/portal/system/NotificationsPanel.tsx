"use client";

import { BellRing, Mail } from "lucide-react";
import { getNotificationsOverviewAction } from "@/lib/actions/systemInsights";
import { Card, LoaderGate, Notice, Pill, RefreshButton, Rows, useLoader } from "./ui";

export function NotificationsPanel() {
  const loader = useLoader(getNotificationsOverviewAction);

  return (
    <LoaderGate loader={loader}>
      {(data) => (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card icon={<Mail size={18} />} title="Email" description="Invitations, verification, password resets and sign-in alerts.">
              <Rows
                rows={[
                  {
                    label: "Provider",
                    value: data.email.configured ? <Pill tone="good">Resend configured</Pill> : <Pill>Not configured</Pill>,
                  },
                  { label: "Sender", value: <span className="break-all">{data.email.sender}</span> },
                ]}
              />
              {!data.email.configured && (
                <div className="mt-4">
                  <Notice tone="warn">
                    No email is being sent. When you add a user, the invite link is shown to you to pass on instead.
                  </Notice>
                </div>
              )}
              {data.email.configured && data.email.sandbox && (
                <div className="mt-4">
                  <Notice tone="warn">
                    Mail goes out from Resend&rsquo;s shared sandbox address, which many inboxes treat as spam. Set
                    RESEND_FROM_EMAIL to a verified domain.
                  </Notice>
                </div>
              )}
            </Card>

            <Card
              icon={<BellRing size={18} />}
              title="In-app notifications"
              description="The bell in the portal header."
              action={<RefreshButton loader={loader} />}
            >
              <Rows
                rows={[
                  { label: "Unread", value: data.inApp.unread.toLocaleString("en-PH") },
                  {
                    label: "Public form submissions",
                    value: data.formsOpen ? <Pill tone="good">Open</Pill> : <Pill tone="warn">Closed</Pill>,
                  },
                ]}
              />
              <div className="mt-4 overflow-x-auto rounded-xl border border-black/5">
                <table className="w-full min-w-80 text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-gray-400">
                      <th scope="col" className="px-4 py-3 font-medium">Type</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">Last 7 days</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">All time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.inApp.types.map((t) => (
                      <tr key={t.label} className="border-t border-black/5">
                        <td className="px-4 py-3 text-navy-900">{t.label}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{t.last7Days.toLocaleString("en-PH")}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{t.total.toLocaleString("en-PH")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <Card icon={<BellRing size={18} />} title="Who gets alerted" description="Every alert the portal sends today.">
            <ul className="divide-y divide-black/5 rounded-xl border border-black/5">
              {data.alerts.map((a) => (
                <li key={a.label} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-900">{a.label}</p>
                    <p className="text-xs text-gray-500">{a.detail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill>{a.channel}</Pill>
                    {a.active ? <Pill tone="good">Active</Pill> : <Pill tone="warn">Off: email not set up</Pill>}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Notice>
                Reminders for attendance, documents and commissions aren&rsquo;t automated. The portal has no scheduled jobs yet,
                so nothing is sent unless someone does something.
              </Notice>
            </div>
          </Card>
        </>
      )}
    </LoaderGate>
  );
}

"use client";

import { useMemo, useState } from "react";
import { TrendingUp, Zap } from "lucide-react";
import { Lead } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { CreateLeadForm } from "@/components/portal/CreateLeadForm";

type PropertyOption = { id: string; title: string };
type SourceBreakdown = { label: string; value: number };

const statusTone = { New: "blue", Qualified: "green", "Follow-up": "gold", Contacted: "gray" } as const;
const priorityTone = { High: "text-red-600", Medium: "text-gold-600", Low: "text-gray-400" } as const;

export function LeadsAdminView({
  leads,
  properties,
  newThisWeek,
  sources,
}: {
  leads: Lead[];
  properties: PropertyOption[];
  newThisWeek: number;
  sources: SourceBreakdown[];
}) {
  const [status, setStatus] = useState("All Statuses");
  const [priority, setPriority] = useState("Any Priority");

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchesStatus = status === "All Statuses" || l.status === status;
      const matchesPriority = priority === "Any Priority" || l.priority === priority;
      return matchesStatus && matchesPriority;
    });
  }, [leads, status, priority]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900 sm:text-3xl">Leads &amp; CRM</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your pipeline and client inquiries with Magis Intelligence.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatCard icon={<TrendingUp size={18} />} label="New Leads" value={`${newThisWeek} this week`} iconBg="bg-gold-100 text-gold-600" />
          <StatCard icon={<Zap size={18} />} label="Total Leads" value={leads.length} iconBg="bg-navy-900 text-white" />
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <CreateLeadForm properties={properties} />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-black/10 bg-offwhite px-3 py-2 text-xs text-navy-900"
            >
              {["All Statuses", "New", "Qualified", "Follow-up", "Contacted"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="rounded-lg border border-black/10 bg-offwhite px-3 py-2 text-xs text-navy-900"
            >
              {["Any Priority", "High", "Medium", "Low"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="bg-navy-900 text-xs uppercase tracking-wide text-white/80">
                <th className="px-6 py-3 font-medium">Client Name</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Property Inquiry</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-t border-black/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={lead.initials} size={36} />
                      <div>
                        <p className="font-semibold text-navy-900">{lead.name}</p>
                        <p className="text-xs text-gray-400">{lead.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    <p>{lead.email}</p>
                    <p>{lead.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-navy-900">{lead.property}</p>
                    <p className="text-xs text-gold-600">{lead.price}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{lead.date}</td>
                  <td className="px-6 py-4">
                    <Badge tone={statusTone[lead.status]}>{lead.status}</Badge>
                  </td>
                  <td className={`px-6 py-4 text-xs font-semibold ${priorityTone[lead.priority]}`}>
                    {lead.priority}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                    No leads match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-black/5 p-4 text-xs text-gray-400">
          Showing {filtered.length} of {leads.length} leads
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold text-navy-900">Lead Sources</h2>
        {sources.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">No leads yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {sources.map((s) => (
              <div key={s.label}>
                <div className="flex h-32 items-end rounded-lg bg-offwhite p-2">
                  <div
                    className="w-full rounded bg-gradient-to-t from-navy-900 to-gold-500"
                    style={{ height: `${s.value}%` }}
                  />
                </div>
                <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {s.label}
                </p>
                <p className="text-center text-sm font-bold text-navy-900">{Math.round(s.value)}%</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

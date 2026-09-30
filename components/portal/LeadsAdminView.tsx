"use client";

import { useMemo, useState, type DragEvent } from "react";
import { TrendingUp, UserRound, Zap } from "lucide-react";
import { Lead } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { CreateLeadForm } from "@/components/portal/CreateLeadForm";
import { leadStatusEnumKey, leadStatusTone } from "@/lib/adapters/lead";
import { assignLeadAction, updateLeadStatusAction } from "@/lib/actions/leads";
import type { TeamAgentRow } from "@/lib/actions/teams";

type PropertyOption = { id: string; title: string };
type SourceBreakdown = { label: string; value: number };

const columns: Lead["status"][] = ["New", "Qualified", "Follow-up", "Contacted", "Won", "Lost", "Archived"];
const priorityTone = { High: "text-red-600", Medium: "text-gold-600", Low: "text-gray-400" } as const;

export function LeadsAdminView({
  leads,
  properties,
  newThisWeek,
  sources,
  agents,
  isAdmin,
}: {
  leads: Lead[];
  properties: PropertyOption[];
  newThisWeek: number;
  sources: SourceBreakdown[];
  agents: TeamAgentRow[];
  isAdmin: boolean;
}) {
  const [rows, setRows] = useState(leads);
  const [priority, setPriority] = useState("Any Priority");
  const [dragOverColumn, setDragOverColumn] = useState<Lead["status"] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(
    () => rows.filter((l) => priority === "Any Priority" || l.priority === priority),
    [rows, priority]
  );

  const grouped = useMemo(() => {
    const map = new Map<Lead["status"], Lead[]>(columns.map((s) => [s, []]));
    for (const lead of filtered) map.get(lead.status)?.push(lead);
    return map;
  }, [filtered]);

  async function moveLead(leadId: string, status: Lead["status"]) {
    const current = rows.find((l) => l.id === leadId);
    if (!current || current.status === status) return;
    setRows((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    const result = await updateLeadStatusAction(leadId, leadStatusEnumKey[status]);
    if (result.error) {
      setRows((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: current.status } : l)));
    }
  }

  async function reassign(leadId: string, agentId: string) {
    setBusyId(leadId);
    const agent = agents.find((a) => a.userId === agentId);
    const result = await assignLeadAction(leadId, agentId || null);
    setBusyId(null);
    if (!result.error) {
      setRows((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, agent: agent ? { id: agent.userId, name: agent.name, photo: agent.photo } : null }
            : l
        )
      );
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>, status: Lead["status"]) {
    e.preventDefault();
    setDragOverColumn(null);
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) moveLead(leadId, status);
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900 sm:text-3xl">Leads &amp; CRM</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin
              ? "Drag a card between columns to update its status, and assign it to an agent from the card."
              : "Your pipeline and client inquiries with Magis Intelligence."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatCard icon={<TrendingUp size={18} />} label="New Leads" value={`${newThisWeek} this week`} iconBg="bg-gold-100 text-gold-600" />
          <StatCard icon={<Zap size={18} />} label="Total Leads" value={leads.length} iconBg="bg-navy-900 text-white" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {isAdmin && <CreateLeadForm properties={properties} />}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs text-navy-900"
        >
          {["Any Priority", "High", "Medium", "Low"].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {columns.map((status) => {
          const columnLeads = grouped.get(status) ?? [];
          const isOver = dragOverColumn === status;
          return (
            <div
              key={status}
              onDragOver={(e) => {
                if (!isAdmin) return;
                e.preventDefault();
                setDragOverColumn(status);
              }}
              onDragLeave={() => setDragOverColumn((c) => (c === status ? null : c))}
              onDrop={(e) => isAdmin && handleDrop(e, status)}
              className={`flex w-72 shrink-0 flex-col rounded-2xl border p-3 transition-colors ${
                isOver ? "border-gold-400 bg-gold-50/50" : "border-black/5 bg-offwhite"
              }`}
            >
              <div className="flex items-center justify-between px-1 pb-3">
                <Badge tone={leadStatusTone[leadStatusEnumKey[status]]}>{status}</Badge>
                <span className="text-xs font-semibold text-gray-400">{columnLeads.length}</span>
              </div>

              <div className="flex flex-1 flex-col gap-2.5">
                {columnLeads.length === 0 && (
                  <p className="rounded-xl border border-dashed border-black/10 p-4 text-center text-xs text-gray-400">
                    No leads here.
                  </p>
                )}
                {columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable={isAdmin}
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", lead.id)}
                    className={`rounded-xl border border-black/5 bg-white p-3 shadow-sm ${
                      isAdmin ? "cursor-grab active:cursor-grabbing" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Avatar initials={lead.initials} size={30} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy-900">{lead.name}</p>
                        <p className="truncate text-xs text-gray-400">{lead.type}</p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-semibold uppercase ${priorityTone[lead.priority]}`}>
                        {lead.priority}
                      </span>
                    </div>

                    <p className="mt-2.5 truncate text-xs font-medium text-navy-700">{lead.property}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400">{lead.date}</p>

                    <div className="mt-3 border-t border-black/5 pt-2.5">
                      {isAdmin ? (
                        <select
                          value={lead.agent?.id ?? ""}
                          disabled={busyId === lead.id}
                          onChange={(e) => reassign(lead.id, e.target.value)}
                          className="w-full rounded-lg border border-black/10 bg-offwhite px-2 py-1.5 text-xs text-navy-900 disabled:opacity-50"
                        >
                          <option value="">Unassigned</option>
                          {agents.map((a) => (
                            <option key={a.userId} value={a.userId}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="flex items-center gap-1.5 text-xs text-gray-500">
                          <UserRound size={12} />
                          {lead.agent?.name ?? "Unassigned"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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

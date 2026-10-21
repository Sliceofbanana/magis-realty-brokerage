"use client";

import { useMemo, useState, useTransition, type DragEvent } from "react";
import { Search, Trash2, TrendingUp, UserRound, Zap } from "lucide-react";
import { Lead } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { BulkActionBar, BulkActionButton } from "@/components/portal/BulkActionBar";
import { useRowSelection } from "@/lib/useRowSelection";
import { StatCard } from "@/components/ui/StatCard";
import { CreateLeadForm } from "@/components/portal/CreateLeadForm";
import { leadStatusEnumKey, leadStatusTone } from "@/lib/adapters/lead";
import { assignLeadAction, deleteLeadsAction, updateLeadStatusAction } from "@/lib/actions/leads";
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
  initialQuery,
}: {
  leads: Lead[];
  properties: PropertyOption[];
  newThisWeek: number;
  sources: SourceBreakdown[];
  agents: TeamAgentRow[];
  isAdmin: boolean;
  initialQuery?: string;
}) {
  const [rows, setRows] = useState(leads);
  const [priority, setPriority] = useState("Any Priority");
  const [query, setQuery] = useState(initialQuery ?? "");
  const [dragOverColumn, setDragOverColumn] = useState<Lead["status"] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = rows;
    if (priority !== "Any Priority") result = result.filter((l) => l.priority === priority);
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.property.toLowerCase().includes(q)
      );
    }
    return result;
  }, [rows, priority, query]);

  const grouped = useMemo(() => {
    const map = new Map<Lead["status"], Lead[]>(columns.map((s) => [s, []]));
    for (const lead of filtered) map.get(lead.status)?.push(lead);
    return map;
  }, [filtered]);

  const selectableIds = useMemo(() => (isAdmin ? filtered.map((l) => l.id) : []), [filtered, isAdmin]);
  const selection = useRowSelection(selectableIds);
  const [bulkPending, startBulk] = useTransition();
  const [bulkError, setBulkError] = useState<string | null>(null);

  function handleBulkDelete() {
    const ids = selection.selectedIds;
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected lead${ids.length === 1 ? "" : "s"}? This can't be undone.`)) return;
    setBulkError(null);
    startBulk(async () => {
      const result = await deleteLeadsAction(ids);
      if (result.error) {
        setBulkError(result.error);
        return;
      }
      setRows((prev) => prev.filter((l) => !ids.includes(l.id)));
      selection.clear();
    });
  }

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
        <div className="relative">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, or property…"
            className="rounded-lg border border-black/10 bg-white py-2 pl-8 pr-3 text-xs text-navy-900 focus:border-navy-900 focus:outline-none"
          />
        </div>
        {isAdmin && (
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <Checkbox
              state={selection.headerState}
              onChange={selection.toggleAll}
              disabled={selectableIds.length === 0 || bulkPending}
              label="Select all leads"
            />
            Select all ({selectableIds.length})
          </label>
        )}
      </div>

      <BulkActionBar
        count={selection.selectedIds.length}
        onClear={selection.clear}
        busy={bulkPending}
        error={bulkError}
        className="mt-3 rounded-lg"
      >
        <BulkActionButton onClick={handleBulkDelete} disabled={bulkPending}>
          <Trash2 size={14} /> {bulkPending ? "Deleting…" : "Delete selected"}
        </BulkActionButton>
      </BulkActionBar>

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
                    className={`rounded-xl border p-3 shadow-sm ${
                      selection.isSelected(lead.id) ? "border-gold-400 bg-gold-100/40" : "border-black/5 bg-white"
                    } ${isAdmin ? "cursor-grab active:cursor-grabbing" : ""}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isAdmin && (
                        <div className="pt-1">
                          <Checkbox
                            state={selection.isSelected(lead.id) ? "checked" : "unchecked"}
                            onChange={() => selection.toggle(lead.id)}
                            disabled={bulkPending}
                            label={`Select ${lead.name}`}
                          />
                        </div>
                      )}
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

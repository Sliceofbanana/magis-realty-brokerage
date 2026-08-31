"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { CreateTeamForm } from "@/components/portal/CreateTeamForm";
import { setAgentTeamAction, type TeamOption, type TeamAgentRow } from "@/lib/actions/teams";

const roleTone: Record<string, "gold" | "blue" | "gray" | "navy"> = {
  ADMINISTRATOR: "gold",
  BROKER: "blue",
  AGENT: "gray",
  MARKETING: "navy",
};

export function TeamsAdminView({ teams, agents }: { teams: TeamOption[]; agents: TeamAgentRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(agents);
  const [busyId, setBusyId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const byTeam = new Map<string | null, TeamAgentRow[]>();
    for (const agent of rows) {
      const key = agent.teamId;
      const list = byTeam.get(key) ?? [];
      list.push(agent);
      byTeam.set(key, list);
    }
    return byTeam;
  }, [rows]);

  const unassignedCount = (grouped.get(null) ?? []).length;

  async function reassign(agentProfileId: string, teamId: string) {
    setBusyId(agentProfileId);
    const result = await setAgentTeamAction(agentProfileId, teamId || null);
    setBusyId(null);
    if (!result.error) {
      setRows((prev) =>
        prev.map((a) => (a.agentProfileId === agentProfileId ? { ...a, teamId: teamId || null } : a))
      );
    }
  }

  function AgentRow({ agent }: { agent: TeamAgentRow }) {
    return (
      <div className="flex items-center justify-between gap-3 border-t border-black/5 px-5 py-3.5 first:border-t-0">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={agent.photo ?? undefined} name={agent.name} size={34} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-navy-900">{agent.name}</p>
            <Badge tone={roleTone[agent.role] ?? "gray"} className="mt-0.5">
              {agent.role}
            </Badge>
          </div>
        </div>
        <select
          value={agent.teamId ?? ""}
          disabled={busyId === agent.agentProfileId}
          onChange={(e) => reassign(agent.agentProfileId, e.target.value)}
          className="rounded-lg border border-black/10 bg-offwhite px-2 py-1.5 text-xs text-navy-900 disabled:opacity-50"
        >
          <option value="">Unassigned</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Teams"
        description="Assign agents to a team — team standings on the Leaderboard reflect this."
        action={<CreateTeamForm onCreated={() => router.refresh()} />}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Teams</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{teams.length}</p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Active Agents</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{rows.length}</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:col-span-2">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Unassigned</p>
          <p className={`mt-1 font-serif text-2xl font-bold ${unassignedCount > 0 ? "text-gold-600" : "text-navy-900"}`}>
            {unassignedCount}
          </p>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-black/10 p-16 text-center text-gray-400">
          No teams yet — create one to start organizing agents.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {teams.map((team) => {
            const members = grouped.get(team.id) ?? [];
            return (
              <div
                key={team.id}
                className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
              >
                <div className="flex items-center gap-2.5 border-b border-black/5 px-5 py-4">
                  <span className={`h-2.5 w-2.5 rounded-full ${team.dot}`} />
                  <h2 className="font-serif text-base font-bold text-navy-900">{team.name}</h2>
                  <span className="ml-auto rounded-full bg-offwhite px-2.5 py-1 text-[11px] font-semibold text-gray-500">
                    {members.length} agent{members.length === 1 ? "" : "s"}
                  </span>
                </div>
                {members.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-gray-400">No agents on this team yet.</p>
                ) : (
                  members.map((agent) => <AgentRow key={agent.agentProfileId} agent={agent} />)
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-dashed border-black/10 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-black/5 px-5 py-4">
          <Users size={16} className="text-gray-400" />
          <h2 className="font-serif text-base font-bold text-navy-900">Unassigned</h2>
          <span className="ml-auto rounded-full bg-offwhite px-2.5 py-1 text-[11px] font-semibold text-gray-500">
            {unassignedCount} agent{unassignedCount === 1 ? "" : "s"}
          </span>
        </div>
        {unassignedCount === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">Every active agent has a team.</p>
        ) : (
          (grouped.get(null) ?? []).map((agent) => <AgentRow key={agent.agentProfileId} agent={agent} />)
        )}
      </div>
    </div>
  );
}

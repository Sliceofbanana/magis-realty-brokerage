"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { setAgentTeamAction, type TeamOption, type TeamAgentRow } from "@/lib/actions/teams";

const toneDot: Record<string, string> = {
  navy: "bg-navy-900",
  gold: "bg-gold-500",
  blue: "bg-sky-400",
};

export function TeamsAdminView({ teams, agents }: { teams: TeamOption[]; agents: TeamAgentRow[] }) {
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
      <div className="flex items-center justify-between gap-3 border-t border-black/5 px-4 py-3 first:border-t-0">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={agent.photo ?? undefined} name={agent.name} size={32} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-navy-900">{agent.name}</p>
            <p className="text-xs text-gray-400">{agent.role}</p>
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
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {teams.map((team) => {
          const members = grouped.get(team.id) ?? [];
          return (
            <div key={team.id} className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3">
                <span className={`h-2.5 w-2.5 rounded-full ${toneDot[team.tone] ?? "bg-gray-400"}`} />
                <h2 className="font-serif text-base font-bold text-navy-900">{team.name}</h2>
                <span className="ml-auto text-xs text-gray-400">{members.length} agents</span>
              </div>
              {members.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-400">No agents on this team yet.</p>
              ) : (
                members.map((agent) => <AgentRow key={agent.agentProfileId} agent={agent} />)
              )}
            </div>
          );
        })}

        <div className="overflow-hidden rounded-2xl border border-dashed border-black/10 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3">
            <Users size={16} className="text-gray-400" />
            <h2 className="font-serif text-base font-bold text-navy-900">Unassigned</h2>
            <span className="ml-auto text-xs text-gray-400">{(grouped.get(null) ?? []).length} agents</span>
          </div>
          {(grouped.get(null) ?? []).length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-400">Every active agent has a team.</p>
          ) : (
            (grouped.get(null) ?? []).map((agent) => <AgentRow key={agent.agentProfileId} agent={agent} />)
          )}
        </div>
      </div>
    </div>
  );
}

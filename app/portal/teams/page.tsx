import { listTeamsWithAgents } from "@/lib/actions/teams";
import { TeamsAdminView } from "@/components/portal/TeamsAdminView";

export const dynamic = "force-dynamic";

export default async function TeamsAdminPage() {
  const data = await listTeamsWithAgents();
  return <TeamsAdminView teams={data.teams} agents={data.agents} />;
}

import { prisma } from "@/lib/prisma";
import { agentWithProfile, toAgent } from "@/lib/adapters/agent";
import { AgentsDirectoryView } from "@/components/public/AgentsDirectoryView";

export const metadata = { title: "Agents | Magis Realty & Brokerage" };
export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const rows = await prisma.user.findMany({
    where: { agentProfile: { bio: { isEmpty: false } } },
    include: agentWithProfile,
    orderBy: { name: "asc" },
  });
  const agents = rows.map(toAgent);

  return <AgentsDirectoryView agents={agents} />;
}

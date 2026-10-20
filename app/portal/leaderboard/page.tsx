import { auth } from "@/auth";
import { loadLeaderboard } from "@/lib/leaderboard";
import { LeaderboardView } from "@/components/portal/LeaderboardView";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await auth();
  const data = await loadLeaderboard(session?.user?.id ?? null);
  return <LeaderboardView data={data} />;
}

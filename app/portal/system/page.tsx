import { notFound } from "next/navigation";
import { getSystemOverviewAction } from "@/lib/actions/system";
import { SystemConsole } from "@/components/portal/system/SystemConsole";

export const metadata = { title: "System | Magis Realty & Brokerage" };
export const dynamic = "force-dynamic";

export default async function SystemPage() {
  // getSystemOverviewAction checks the database for the System Admin tag and throws otherwise.
  const overview = await getSystemOverviewAction().catch(() => null);
  if (!overview) notFound();
  return <SystemConsole overview={overview} />;
}

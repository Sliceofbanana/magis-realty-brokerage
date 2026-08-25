import { listJobApplications } from "@/lib/actions/careers";
import { CareersAdminView } from "@/components/portal/CareersAdminView";

export const dynamic = "force-dynamic";

export default async function CareersAdminPage() {
  const applications = await listJobApplications();
  return <CareersAdminView applications={applications} />;
}

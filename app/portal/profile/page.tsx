import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileEditor } from "@/components/portal/ProfileEditor";

export const dynamic = "force-dynamic";

export default async function ProfileAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { agentProfile: true },
  });
  if (!user) redirect("/login");

  return (
    <ProfileEditor
      user={{
        name: user.name,
        position: user.position,
        primaryOffice: user.primaryOffice,
        phone: user.phone,
        email: user.email,
        photo: user.photo,
      }}
      agentProfile={
        user.agentProfile
          ? {
              slug: user.agentProfile.slug,
              prcLicense: user.agentProfile.prcLicense,
              dhsudRegistration: user.agentProfile.dhsudRegistration,
              languages: user.agentProfile.languages,
              bio: user.agentProfile.bio,
              yearsExperience: user.agentProfile.yearsExperience,
              specialization: user.agentProfile.specialization,
              linkedinUrl: user.agentProfile.linkedinUrl,
              facebookUrl: user.agentProfile.facebookUrl,
              instagramUrl: user.agentProfile.instagramUrl,
            }
          : null
      }
    />
  );
}

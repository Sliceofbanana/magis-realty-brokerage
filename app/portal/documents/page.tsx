import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { documentWithRelations, toDocumentFile } from "@/lib/adapters/document";
import { DocumentsAdminView } from "@/components/portal/DocumentsAdminView";

export const dynamic = "force-dynamic";

export default async function DocumentsAdminPage() {
  const session = await auth();
  if (!session?.user) return null;

  const isAdmin = session.user.role === "ADMINISTRATOR";
  const [rows, properties] = await Promise.all([
    prisma.documentFile.findMany({
      where: isAdmin
        ? {}
        : {
            OR: [
              { uploadedById: session.user.id },
              { category: "CONTRACT_TEMPLATE" },
              { property: { agentId: session.user.id } },
            ],
          },
      include: documentWithRelations,
      orderBy: { uploadedAt: "desc" },
    }),
    prisma.property.findMany({
      where: { archived: false },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <DocumentsAdminView
      documents={rows.map(toDocumentFile)}
      properties={properties}
      currentUserId={session.user.id}
      isAdmin={isAdmin}
    />
  );
}

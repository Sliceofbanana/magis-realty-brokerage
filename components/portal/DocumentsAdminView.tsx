"use client";

import { useMemo, useState } from "react";
import {
  Folder,
  Building,
  FileSignature,
  Archive,
  FileText,
  File,
  Image as ImageIcon,
  Map,
  Download,
  Trash2,
} from "lucide-react";
import { DocumentFile } from "@/lib/types";
import { PageHeader } from "@/components/portal/PageHeader";
import { UploadDocumentForm } from "@/components/portal/UploadDocumentForm";
import { deleteDocumentFormAction } from "@/lib/actions/documents";

type PropertyOption = { id: string; title: string };

const folders: { key: DocumentFile["categoryKey"]; label: string; icon: typeof Folder }[] = [
  { key: "PERSONAL", label: "Personal Documents", icon: Folder },
  { key: "PROPERTY", label: "Property Documents", icon: Building },
  { key: "CONTRACT_TEMPLATE", label: "Contract Templates", icon: FileSignature },
  { key: "ARCHIVE", label: "Archive", icon: Archive },
];

const typeIcon: Record<string, { icon: typeof FileText; className: string }> = {
  PDF: { icon: FileText, className: "bg-red-100 text-red-600" },
  DOCX: { icon: File, className: "bg-sky-100 text-navy-700" },
  XLSX: { icon: FileText, className: "bg-emerald-100 text-emerald-700" },
  JPG: { icon: ImageIcon, className: "bg-sky-100 text-navy-700" },
  PNG: { icon: ImageIcon, className: "bg-sky-100 text-navy-700" },
};

export function DocumentsAdminView({
  documents,
  properties,
  currentUserId,
  isAdmin,
}: {
  documents: DocumentFile[];
  properties: PropertyOption[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [activeFolder, setActiveFolder] = useState<DocumentFile["categoryKey"]>("PERSONAL");
  const [type, setType] = useState("All Types");

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of folders) counts[f.key] = documents.filter((d) => d.categoryKey === f.key).length;
    return counts;
  }, [documents]);

  const filtered = useMemo(() => {
    return documents
      .filter((d) => d.categoryKey === activeFolder)
      .filter((d) => type === "All Types" || d.type === type);
  }, [documents, activeFolder, type]);

  function handleDeleteSubmit(e: React.FormEvent) {
    if (!confirm("Delete this document? This can't be undone.")) e.preventDefault();
  }

  return (
    <div>
      <PageHeader
        title="Documents & Files"
        description="Manage your professional licenses, property deeds, and contract templates in a secure environment."
        action={<UploadDocumentForm properties={properties} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <div className="h-fit rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Folders</p>
          <div className="mt-3 space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.key}
                type="button"
                onClick={() => setActiveFolder(folder.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  activeFolder === folder.key
                    ? "bg-gold-100 text-navy-900"
                    : "text-gray-600 hover:bg-offwhite"
                }`}
              >
                <folder.icon size={18} className="text-gold-600" />
                <span className="flex-1 text-left">{folder.label}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
                  {folderCounts[folder.key] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-4 border-b border-black/5 p-4 text-xs text-gray-500">
            <span>
              Type:{" "}
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="ml-1 rounded border border-black/10 bg-offwhite px-2 py-1 text-navy-900"
              >
                {["All Types", "PDF", "DOCX", "XLSX", "JPG", "PNG"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </span>
            <span className="ml-auto flex items-center gap-1 text-navy-900">
              <Map size={14} /> Showing {filtered.length} documents
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-3 font-medium">Document Name</th>
                  <th className="px-6 py-3 font-medium">Uploaded By</th>
                  <th className="px-6 py-3 font-medium">Date Uploaded</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => {
                  const config = typeIcon[doc.type] ?? typeIcon.PDF;
                  const Icon = config.icon;
                  const canDelete = isAdmin || doc.uploadedById === currentUserId;
                  return (
                    <tr key={doc.id} className="border-t border-black/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.className}`}>
                            <Icon size={18} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-navy-900">{doc.name}</p>
                            <p className="text-xs text-gray-400">
                              {doc.size}
                              {doc.propertyTitle && ` · Linked to: ${doc.propertyTitle}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{doc.uploadedByName}</td>
                      <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-gray-400">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            aria-label="Download"
                            className="hover:text-navy-900"
                          >
                            <Download size={16} />
                          </a>
                          {canDelete && (
                            <form action={deleteDocumentFormAction.bind(null, doc.id)} onSubmit={handleDeleteSubmit}>
                              <button type="submit" aria-label="Delete" className="hover:text-red-600">
                                <Trash2 size={16} />
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                      No documents in this folder.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

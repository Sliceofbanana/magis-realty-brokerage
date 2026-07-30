"use client";

import { useMemo, useState } from "react";
import { Upload, Folder, Building, FileSignature, Archive, FileText, File, Image as ImageIcon, Map } from "lucide-react";
import { documents } from "@/lib/data/documents";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";

const folders = [
  { label: "Personal Documents", count: 12, icon: Folder },
  { label: "Property Documents", count: 48, icon: Building },
  { label: "Contract Templates", count: 5, icon: FileSignature },
  { label: "Archive", count: null, icon: Archive },
];

const typeIcon: Record<string, { icon: typeof FileText; className: string }> = {
  PDF: { icon: FileText, className: "bg-red-100 text-red-600" },
  DOCX: { icon: File, className: "bg-sky-100 text-navy-700" },
  XLSX: { icon: FileText, className: "bg-emerald-100 text-emerald-700" },
  JPG: { icon: ImageIcon, className: "bg-sky-100 text-navy-700" },
};

export default function DocumentsAdminPage() {
  const [activeFolder, setActiveFolder] = useState("Personal Documents");
  const [type, setType] = useState("All Types");

  const filtered = useMemo(() => {
    if (type === "All Types") return documents;
    return documents.filter((d) => d.type === type);
  }, [type]);

  return (
    <div>
      <PageHeader
        title="Documents & Files"
        description="Manage your professional licenses, property deeds, and contract templates in a secure environment."
        action={
          <Button>
            <Upload size={16} /> Upload New Document
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <div className="h-fit rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Folders</p>
          <div className="mt-3 space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.label}
                type="button"
                onClick={() => setActiveFolder(folder.label)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  activeFolder === folder.label
                    ? "bg-gold-100 text-navy-900"
                    : "text-gray-600 hover:bg-offwhite"
                }`}
              >
                <folder.icon size={18} className="text-gold-600" />
                <span className="flex-1 text-left">{folder.label}</span>
                {folder.count !== null && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
                    {folder.count}
                  </span>
                )}
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
                {["All Types", "PDF", "DOCX", "XLSX", "JPG"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </span>
            <span>Status: <strong className="text-navy-900">All Statuses</strong></span>
            <span>Date: <strong className="text-navy-900">Last 30 Days</strong></span>
            <span className="ml-auto flex items-center gap-1 text-navy-900">
              <Map size={14} /> Showing {filtered.length} documents
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-3 font-medium">Document Name</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Date Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => {
                  const config = typeIcon[doc.type] ?? typeIcon.PDF;
                  const Icon = config.icon;
                  return (
                    <tr key={doc.id} className="border-t border-black/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.className}`}>
                            <Icon size={18} />
                          </span>
                          <div>
                            <p className="font-semibold text-navy-900">{doc.name}</p>
                            <p className="text-xs text-gray-400">{doc.size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{doc.category}</td>
                      <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                      No documents of this type.
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

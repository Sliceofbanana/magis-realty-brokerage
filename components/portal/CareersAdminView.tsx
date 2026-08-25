"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { updateJobApplicationStatusAction, type JobApplicationRow } from "@/lib/actions/careers";

const statusOptions = ["APPLIED", "REVIEWING", "INTERVIEW", "REJECTED", "HIRED"] as const;
type Status = (typeof statusOptions)[number];

const statusLabel: Record<Status, string> = {
  APPLIED: "Applied",
  REVIEWING: "Reviewing",
  INTERVIEW: "Interview",
  REJECTED: "Rejected",
  HIRED: "Hired",
};

const statusTone: Record<Status, "gray" | "blue" | "gold" | "red" | "green"> = {
  APPLIED: "gray",
  REVIEWING: "blue",
  INTERVIEW: "gold",
  REJECTED: "red",
  HIRED: "green",
};

const filters = ["All", ...statusOptions] as const;

export function CareersAdminView({ applications }: { applications: JobApplicationRow[] }) {
  const [rows, setRows] = useState(applications);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "All" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter]
  );

  async function changeStatus(id: string, status: Status) {
    setBusyId(id);
    const result = await updateJobApplicationStatusAction(id, status);
    setBusyId(null);
    if (!result.error) {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    }
  }

  return (
    <div>
      <PageHeader
        title="Careers & Applicants"
        description="Review applications submitted through the public Careers page."
      />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Status:</span>
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              filter === f ? "bg-navy-900 text-white" : "bg-offwhite text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f === "All" ? "All" : statusLabel[f]}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500">
          Showing {filtered.length} of {rows.length} applicants
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3 font-medium">Applicant</th>
                <th className="px-6 py-3 font-medium">Area of Expertise</th>
                <th className="px-6 py-3 font-medium">Applied</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id} className="border-t border-black/5">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-navy-900">{app.name}</p>
                    <p className="text-xs text-gray-400">{app.email}</p>
                    {app.portfolioUrl && (
                      <a
                        href={app.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gold-600 hover:underline"
                      >
                        View portfolio
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{app.positionInterest}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(app.appliedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Badge tone={statusTone[app.status]}>{statusLabel[app.status]}</Badge>
                      <select
                        value={app.status}
                        disabled={busyId === app.id}
                        onChange={(e) => changeStatus(app.id, e.target.value as Status)}
                        className="rounded-lg border border-black/10 bg-offwhite px-2 py-1 text-xs text-navy-900 disabled:opacity-50"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    No applicants in this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createTeamAction } from "@/lib/actions/teams";
import { teamTones } from "@/lib/teamTones";

export function CreateTeamForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tone, setTone] = useState(teamTones[0].key);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await createTeamAction(name, tone);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
    setTone(teamTones[0].key);
    setOpen(false);
    onCreated();
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={14} /> Create Team
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-team-title"
          className="fixed inset-0 z-100 flex items-center justify-center bg-navy-950/70 p-4"
        >
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <h2 id="create-team-title" className="font-serif text-lg font-bold text-navy-900">
                Create Team
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-navy-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label htmlFor="teamName" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Team Name
                </label>
                <input
                  id="teamName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Team Summit"
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="teamTone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Accent Color
                </label>
                <select
                  id="teamTone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                >
                  {teamTones.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Creating…" : "Create Team"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

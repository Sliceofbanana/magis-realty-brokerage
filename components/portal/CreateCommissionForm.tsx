"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createCommissionRecordAction, type CommissionActionResult } from "@/lib/actions/commissions";

type AgentOption = { id: string; name: string; role: string };

export function CreateCommissionForm({ agents }: { agents: AgentOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<CommissionActionResult, FormData>(
    createCommissionRecordAction,
    null as unknown as CommissionActionResult
  );

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) setOpen(false);
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={14} /> New Transaction
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-commission-title"
          className="fixed inset-0 z-100 flex items-center justify-center bg-navy-950/70 p-4"
        >
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <h2 id="create-commission-title" className="font-serif text-lg font-bold text-navy-900">
                New Transaction
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

            <form action={formAction} className="space-y-4 px-6 py-5">
              <div>
                <label htmlFor="agentId" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Agent
                </label>
                <select
                  id="agentId"
                  name="agentId"
                  defaultValue=""
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                >
                  <option value="" disabled>
                    Select an agent
                  </option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="propertyLabel" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Property Name
                </label>
                <input
                  id="propertyLabel"
                  name="propertyLabel"
                  placeholder="The Grand Residences, Unit 42B"
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="closedDate" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Closed Date
                  </label>
                  <input
                    id="closedDate"
                    name="closedDate"
                    type="date"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="earned" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Commission Earned
                  </label>
                  <input
                    id="earned"
                    name="earned"
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
              </div>

              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Saving…" : "Save Transaction"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

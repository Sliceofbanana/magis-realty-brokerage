"use client";

import { useActionState, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createLeadAction, type CreateLeadResult } from "@/lib/actions/leads";

type PropertyOption = { id: string; title: string };

export function CreateLeadForm({ properties }: { properties: PropertyOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<CreateLeadResult, FormData>(
    createLeadAction,
    null as unknown as CreateLeadResult
  );

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) setOpen(false);
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Add New Lead
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-lead-title"
          className="fixed inset-0 z-100 flex items-center justify-center bg-navy-950/70 p-4"
        >
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <h2 id="create-lead-title" className="font-serif text-lg font-bold text-navy-900">
                Add New Lead
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="type" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Type
                  </label>
                  <input
                    id="type"
                    name="type"
                    placeholder="Buyer, Investor..."
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="propertyId" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Property (optional)
                </label>
                <select
                  id="propertyId"
                  name="propertyId"
                  defaultValue=""
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                >
                  <option value="">General Inquiry</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue="NEW"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  >
                    <option value="NEW">New</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="FOLLOW_UP">Follow-up</option>
                    <option value="CONTACTED">Contacted</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="priority" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    defaultValue="MEDIUM"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Notes (optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>

              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Adding…" : "Add Lead"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

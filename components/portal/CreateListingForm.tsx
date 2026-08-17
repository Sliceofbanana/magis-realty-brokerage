"use client";

import { useActionState, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createPropertyAction, type CreatePropertyResult } from "@/lib/actions/properties";

type AgentOption = { id: string; name: string; role: string };

export function CreateListingForm({ agents }: { agents: AgentOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<CreatePropertyResult, FormData>(
    createPropertyAction,
    null as unknown as CreatePropertyResult
  );

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add New Listing</Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-listing-title"
          className="fixed inset-0 z-100 flex items-center justify-center bg-navy-950/70 p-4"
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <h2 id="create-listing-title" className="font-serif text-lg font-bold text-navy-900">
                Add New Listing
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
                <label htmlFor="title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="collection" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Collection (optional)
                  </label>
                  <input
                    id="collection"
                    name="collection"
                    placeholder="Skyline Collection"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="agentId" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Listing Agent
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue="FOR_SALE"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  >
                    <option value="FOR_SALE">For Sale</option>
                    <option value="EXCLUSIVE">Exclusive</option>
                    <option value="PENDING">Pending</option>
                    <option value="SOLD">Sold</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="type" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    defaultValue="RESIDENTIAL"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  >
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    placeholder="Bonifacio Global City, Taguig"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Full Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="price" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Price
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="pricePerSqft" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Price / sqft
                  </label>
                  <input
                    id="pricePerSqft"
                    name="pricePerSqft"
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="area" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Area (sqft)
                  </label>
                  <input
                    id="area"
                    name="area"
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="beds" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Beds
                  </label>
                  <input
                    id="beds"
                    name="beds"
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="baths" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Baths
                  </label>
                  <input
                    id="baths"
                    name="baths"
                    type="number"
                    min={0}
                    step="0.5"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="parking" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Parking
                  </label>
                  <input
                    id="parking"
                    name="parking"
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Description (separate paragraphs with a blank line)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="amenities" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Amenities (comma-separated)
                </label>
                <input
                  id="amenities"
                  name="amenities"
                  placeholder="Infinity Pool, 24/7 Concierge, Smart Home"
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="image" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Cover Image URL (optional)
                </label>
                <input
                  id="image"
                  name="image"
                  placeholder="/images/..."
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>

              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Creating…" : "Create Listing"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

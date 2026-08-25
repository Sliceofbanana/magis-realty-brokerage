"use client";

import { useActionState, useState } from "react";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  createPropertyAction,
  updatePropertyAction,
  type CreatePropertyResult,
} from "@/lib/actions/properties";
import type { Property } from "@/lib/types";

type AgentOption = { id: string; name: string; role: string };

const statusToEnum: Record<Property["status"], string> = {
  "For Sale": "FOR_SALE",
  Exclusive: "EXCLUSIVE",
  Pending: "PENDING",
  Sold: "SOLD",
};

const typeToEnum: Record<Property["type"], string> = {
  Residential: "RESIDENTIAL",
  Commercial: "COMMERCIAL",
};

const regionToEnum: Record<Property["region"], string> = {
  "North Cebu": "NORTH",
  "Central Cebu": "CENTRAL",
  "South Cebu": "SOUTH",
};

export function CreateListingForm({
  agents,
  property,
}: {
  agents: AgentOption[];
  /** When provided, the form opens in edit mode for this listing instead of creating a new one. */
  property?: Property & { agentUserId: string };
}) {
  const isEdit = !!property;
  const [open, setOpen] = useState(false);
  const action = isEdit ? updatePropertyAction.bind(null, property.id) : createPropertyAction;
  const [state, formAction, pending] = useActionState<CreatePropertyResult, FormData>(
    action,
    null as unknown as CreatePropertyResult
  );

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) setOpen(false);
  }

  return (
    <>
      {isEdit ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Edit listing"
          className="text-gray-400 hover:text-navy-900"
        >
          <Pencil size={16} />
        </button>
      ) : (
        <Button onClick={() => setOpen(true)}>Add New Listing</Button>
      )}

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
                {isEdit ? "Edit Listing" : "Add New Listing"}
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
                  defaultValue={property?.title}
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
                    defaultValue={property?.collection}
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
                    defaultValue={property?.agentUserId ?? ""}
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="status" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={property ? statusToEnum[property.status] : "FOR_SALE"}
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
                    defaultValue={property ? typeToEnum[property.type] : "RESIDENTIAL"}
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  >
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="region" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Region
                  </label>
                  <select
                    id="region"
                    name="region"
                    defaultValue={property ? regionToEnum[property.region] : "CENTRAL"}
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  >
                    <option value="NORTH">North Cebu</option>
                    <option value="CENTRAL">Central Cebu</option>
                    <option value="SOUTH">South Cebu</option>
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
                    defaultValue={property?.location}
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
                    defaultValue={property?.address}
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
                    defaultValue={property?.price}
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
                    defaultValue={property?.pricePerSqft || undefined}
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
                    defaultValue={property?.area}
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
                    defaultValue={property?.beds}
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
                    defaultValue={property?.baths}
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
                    defaultValue={property?.parking}
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
                  defaultValue={property?.description.join("\n\n")}
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
                  defaultValue={property?.amenities.join(", ")}
                  placeholder="Infinity Pool, 24/7 Concierge, Smart Home"
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="image" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Cover Photo {isEdit && "(optional — leave blank to keep the current photo)"}
                </label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
              </div>

              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Listing"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

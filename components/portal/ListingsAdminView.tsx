"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { LayoutGrid, List, Pencil, Archive, History } from "lucide-react";
import { Property } from "@/lib/types";
import { PageHeader } from "@/components/portal/PageHeader";
import { CreateListingForm } from "@/components/portal/CreateListingForm";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";

type AgentOption = { id: string; name: string; role: string };

const filters = ["All", "Active", "Sold", "Pending"] as const;

function displayStatus(status: string) {
  if (status === "For Sale" || status === "Exclusive") return "Active";
  return status as "Sold" | "Pending";
}

const statusTone = { Active: "navy", Sold: "green", Pending: "gold" } as const;

export function ListingsAdminView({
  properties,
  agents,
}: {
  properties: Property[];
  agents: AgentOption[];
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const filtered = useMemo(() => {
    if (filter === "All") return properties;
    return properties.filter((p) => displayStatus(p.status) === filter);
  }, [properties, filter]);

  return (
    <div>
      <PageHeader
        title="Property Listings"
        description="Manage your properties across the portfolio."
        action={<CreateListingForm agents={agents} />}
      />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
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
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          Showing {filtered.length} of {properties.length} properties
          <span className="flex overflow-hidden rounded-lg border border-black/10">
            <span className="flex h-8 w-8 items-center justify-center bg-navy-900 text-white">
              <LayoutGrid size={14} />
            </span>
            <span className="flex h-8 w-8 items-center justify-center text-gray-400">
              <List size={14} />
            </span>
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-black/10 p-16 text-center text-gray-400">
            No listings match this filter.
          </div>
        ) : (
          filtered.map((property) => {
            const status = displayStatus(property.status);
            return (
              <div
                key={property.id}
                className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
              >
                <div className="relative h-40 w-full">
                  <Image src={property.image} alt={property.title} fill className="object-cover" />
                  <div className="absolute left-3 top-3">
                    <Badge tone={statusTone[status]}>{status.toUpperCase()}</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-serif text-base font-bold text-navy-900">
                      {property.title}
                    </p>
                    <span className="shrink-0 rounded bg-offwhite px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                      {property.type}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-gray-500">{property.location}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                    {property.beds > 0 && <span>{property.beds} bd</span>}
                    <span>{property.baths} ba</span>
                    <span>{property.area.toLocaleString()} sqm</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
                    <div>
                      <p className="text-[10px] uppercase text-gray-400">
                        {status === "Sold" ? "Sold Price" : "Listing Price"}
                      </p>
                      <p className="font-serif text-sm font-bold text-navy-900">
                        {formatCurrency(property.price)}
                      </p>
                    </div>
                    <div className="flex gap-1 text-gray-400">
                      {status === "Sold" ? (
                        <span aria-label="History (coming soon)" title="Coming soon" className="cursor-not-allowed opacity-40">
                          <History size={16} />
                        </span>
                      ) : (
                        <span aria-label="Edit (coming soon)" title="Coming soon" className="cursor-not-allowed opacity-40">
                          <Pencil size={16} />
                        </span>
                      )}
                      <span aria-label="Archive (coming soon)" title="Coming soon" className="cursor-not-allowed opacity-40">
                        <Archive size={16} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

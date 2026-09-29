"use client";

import { useMemo, useState } from "react";
import { Property } from "@/lib/types";
import { PropertyCard } from "@/components/public/PropertyCard";

const typeOptions = ["All Types", "Residential", "Commercial"] as const;
const statusOptions = ["All Status", "For Sale", "Pending", "Sold", "Exclusive"] as const;

export function PortfolioGrid({ properties }: { properties: Property[] }) {
  const [type, setType] = useState<(typeof typeOptions)[number]>("All Types");
  const [status, setStatus] = useState<(typeof statusOptions)[number]>("All Status");

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (type !== "All Types" && p.type !== type) return false;
      if (status !== "All Status" && p.status !== status) return false;
      return true;
    });
  }, [properties, type, status]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setType(opt)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                type === opt
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-black/10 text-gray-600 hover:border-navy-900"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setStatus(opt)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                status === opt
                  ? "border-gold-500 bg-gold-500 text-navy-950"
                  : "border-black/10 text-gray-600 hover:border-gold-500"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs uppercase tracking-wide text-gray-400">
        Showing {filtered.length} of {properties.length} portfolio assets
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-gray-500">
          No assets match this filter right now — check back as new listings are added.
        </p>
      )}
    </div>
  );
}

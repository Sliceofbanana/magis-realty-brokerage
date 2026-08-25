"use client";

import { useMemo, useState } from "react";
import { Map, ChevronDown } from "lucide-react";
import { Property } from "@/lib/types";
import { PropertyCard } from "@/components/public/PropertyCard";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";

const amenityOptions = ["Pool", "Security", "Gym", "Smart Home", "Garden", "Wine"];
const regionOptions = ["Any Region", "North Cebu", "Central Cebu", "South Cebu"];
const sortOptions = [
  { value: "newest", label: "Newest Listings" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;
const PAGE_SIZE = 6;

export function PropertiesFilterView({
  properties,
  initialLocation,
  initialType,
}: {
  properties: Property[];
  initialLocation?: string;
  initialType?: string;
}) {
  const [types, setTypes] = useState<string[]>(initialType ? [initialType] : []);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [beds, setBeds] = useState("Any");
  const [region, setRegion] = useState(initialLocation ?? "Any Region");
  const [baths, setBaths] = useState("Any");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("newest");
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    setPage(1);
  }

  const filtered = useMemo(() => {
    const result = properties.filter((p) => {
      if (types.length && !types.includes(p.type)) return false;
      if (region !== "Any Region" && p.region !== region) return false;
      if (p.price < minPrice || p.price > maxPrice) return false;
      if (beds !== "Any" && p.beds < Number(beds)) return false;
      if (baths !== "Any" && p.baths < Number(baths)) return false;
      if (
        amenities.length &&
        !amenities.every((a) =>
          p.amenities.some((full) => full.toLowerCase().includes(a.toLowerCase()))
        )
      )
        return false;
      return true;
    });

    if (sortBy === "price-asc") return [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") return [...result].sort((a, b) => b.price - a.price);
    return result; // "newest" — already ordered by createdAt desc from the server
  }, [properties, types, region, minPrice, maxPrice, beds, baths, amenities, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const mapQuery =
    region !== "Any Region" ? `${region}, Philippines` : "Cebu, Philippines";

  function resetAll() {
    setTypes([]);
    setMinPrice(0);
    setMaxPrice(10000000);
    setBeds("Any");
    setBaths("Any");
    setRegion("Any Region");
    setAmenities([]);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy-900 sm:text-4xl">
            Premium Property Collections
          </h1>
          <p className="mt-2 max-w-xl text-sm text-gray-500">
            Explore our curated selection of high-end residential and commercial
            estates across the region&rsquo;s most prestigious locations.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMap((v) => !v)}
            className={showMap ? "bg-navy-900 text-white" : ""}
          >
            <Map size={14} /> {showMap ? "Show List" : "Show Map"}
          </Button>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as (typeof sortOptions)[number]["value"])}
              aria-label="Sort properties"
              className="appearance-none rounded-lg border border-black/10 bg-white py-2 pl-4 pr-9 text-sm font-semibold text-navy-900 hover:border-black/20 focus:outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-navy-900">Filters</h2>
            <button
              type="button"
              onClick={resetAll}
              className="text-xs font-semibold text-gold-600 hover:underline"
            >
              Reset All
            </button>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Property Type
            </p>
            <div className="mt-3 space-y-2">
              {["Residential", "Commercial"].map((type) => (
                <label key={type} className="flex items-center gap-2 text-sm text-navy-900">
                  <input
                    type="checkbox"
                    checked={types.includes(type)}
                    onChange={() => toggle(types, setTypes, type)}
                    className="h-4 w-4 rounded border-gray-300 text-navy-900 focus:ring-navy-900"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Price Range (PHP)
            </p>
            <div className="mt-3 space-y-3">
              <input
                type="range"
                min={0}
                max={10000000}
                step={100000}
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(Math.min(Number(e.target.value), maxPrice));
                  setPage(1);
                }}
                className="w-full accent-gold-500"
                aria-label="Minimum price"
              />
              <input
                type="range"
                min={0}
                max={10000000}
                step={100000}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Math.max(Number(e.target.value), minPrice));
                  setPage(1);
                }}
                className="w-full accent-gold-500"
                aria-label="Maximum price"
              />
              <div className="flex justify-between text-xs font-semibold text-navy-900">
                <span>₱{(minPrice / 1000000).toFixed(1)}M</span>
                <span>₱{(maxPrice / 1000000).toFixed(1)}M+</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="beds" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Bedrooms
              </label>
              <select
                id="beds"
                value={beds}
                onChange={(e) => {
                  setBeds(e.target.value);
                  setPage(1);
                }}
                className="mt-2 w-full rounded-lg border border-black/10 bg-gray-50 px-2 py-2 text-sm text-navy-900"
              >
                {["Any", "1", "2", "3", "4", "5"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="baths" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Bathrooms
              </label>
              <select
                id="baths"
                value={baths}
                onChange={(e) => {
                  setBaths(e.target.value);
                  setPage(1);
                }}
                className="mt-2 w-full rounded-lg border border-black/10 bg-gray-50 px-2 py-2 text-sm text-navy-900"
              >
                {["Any", "1", "2", "3", "4", "5"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
              <div className="col-span-2">
                <label htmlFor="region" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Region
                </label>
                <select
                  id="region"
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    setPage(1);
                  }}
                  className="mt-2 w-full rounded-lg border border-black/10 bg-gray-50 px-2 py-2 text-sm text-navy-900"
                >
                  {regionOptions.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Amenities
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {amenityOptions.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggle(amenities, setAmenities, a)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    amenities.includes(a)
                      ? "bg-navy-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <Button className="mt-6 w-full" onClick={() => setPage(1)}>
            Apply Filters
          </Button>
        </aside>

        <div>
          <p className="mb-4 text-sm text-gray-500">
            Showing {paged.length} of {filtered.length} properties
          </p>

          {showMap ? (
            <div className="overflow-hidden rounded-2xl border border-black/5 shadow-sm">
              <iframe
                title="Map of filtered properties"
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                className="h-[520px] w-full border-0"
                loading="lazy"
              />
            </div>
          ) : paged.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 p-12 text-center text-sm text-gray-500">
              No properties match your filters. Try resetting them.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {paged.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {!showMap && totalPages > 1 && (
            <div className="mt-10">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

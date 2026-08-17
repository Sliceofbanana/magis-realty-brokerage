"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

export function HomeHero() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("Residential");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (propertyType) params.set("type", propertyType);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <section className="relative">
      <div className="relative h-140 w-full sm:h-150">
        <Image
          src="/images/hero.webp"
          alt="Aerial view of a luxury coastal resort property at dusk"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-navy-950/90 via-navy-950/30 to-navy-950/10" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
          <h1 className="max-w-2xl font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
            Discover Your Legacy Through{" "}
            <span className="text-gold-400">Premium Real Estate</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/80">
            Magis Realty connects discerning clients with exceptional properties,
            offering a curated portfolio of residences and strategic investments.
          </p>
        </div>
      </div>

      <div className="relative mx-auto -mt-10 max-w-5xl px-4 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-xl sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end"
        >
          <div>
            <label htmlFor="hero-location" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Location
            </label>
            <select
              id="hero-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
            >
              <option>North Cebu</option>
              <option>Cebu City</option>
              <option>South Cebu</option>
            </select>
          </div>
          <div>
            <label htmlFor="hero-type" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Property Type
            </label>
            <select
              id="hero-type"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
            >
              <option>Residential</option>
              <option>Commercial</option>
            </select>
          </div>
          <div>
            <label htmlFor="hero-price" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Price Range
            </label>
            <select
              id="hero-price"
              className="w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
            >
              <option>₱500k - ₱1M</option>
              <option>₱1M - ₱5M</option>
              <option>₱5M+</option>
            </select>
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-navy-800"
          >
            <Search size={16} /> Search
          </button>
        </form>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, ShieldCheck } from "lucide-react";

const headlineVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function HomeHero({ trustLine }: { trustLine?: string }) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("Residential");
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (propertyType) params.set("type", propertyType);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <section className="relative">
      <div ref={sectionRef} className="relative h-140 w-full overflow-hidden sm:h-150">
        <motion.div style={{ y: imageY }} className="absolute inset-0 h-[120%]">
          <Image
            src="/images/hero.webp"
            alt="Aerial view of a luxury coastal resort property at dusk"
            fill
            priority
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-linear-to-t from-navy-950/90 via-navy-950/30 to-navy-950/10" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0}
            variants={headlineVariants}
            className="max-w-2xl font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl"
          >
            Discover Your Legacy Through{" "}
            <span className="text-gold-400">Premium Real Estate</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.15}
            variants={headlineVariants}
            className="mt-5 max-w-lg text-base leading-relaxed text-white/80"
          >
            Magis Realty connects discerning clients with exceptional properties,
            offering a curated portfolio of residences and strategic investments.
          </motion.p>
          {trustLine && (
            <motion.p
              initial="hidden"
              animate="visible"
              custom={0.3}
              variants={headlineVariants}
              className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold-300"
            >
              <ShieldCheck size={14} /> {trustLine}
            </motion.p>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative mx-auto -mt-10 max-w-5xl px-4 sm:px-6 lg:px-8"
      >
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 rounded-2xl border-t-2 border-gold-400 bg-white p-4 shadow-2xl sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end"
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
              <option>Central Cebu</option>
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
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-navy-800"
          >
            <Search size={16} /> Search
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
}

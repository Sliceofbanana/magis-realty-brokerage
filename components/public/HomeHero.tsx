"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search } from "lucide-react";

const propertyTypes = ["Residential", "Commercial"] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function HomeHero({ trustLine }: { trustLine?: string }) {
  const router = useRouter();
  const [location, setLocation] = useState("North Cebu");
  const [propertyType, setPropertyType] = useState<(typeof propertyTypes)[number]>("Residential");
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
    <div ref={sectionRef} className="relative h-[640px] w-full overflow-hidden sm:h-[760px]">
      <motion.div style={{ y: imageY }} className="absolute inset-0 h-[120%]">
        <Image
          src="/images/hero.webp"
          alt="Aerial view of a luxury coastal resort property at dusk"
          fill
          priority
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-950/55 to-navy-950/25" />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pb-32 sm:px-6 lg:px-8">
        <motion.h1
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="max-w-3xl font-serif text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-7xl"
        >
          Discover Your Legacy Through{" "}
          <span className="text-gold-400">Premium Real Estate</span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          custom={0.15}
          variants={fadeUp}
          className="mt-6 max-w-lg text-base leading-relaxed text-white/75"
        >
          Magis Realty connects discerning clients with exceptional properties,
          offering a curated portfolio of residences and strategic investments.
        </motion.p>
        {trustLine && (
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.3}
            variants={fadeUp}
            className="mt-5 text-sm text-white/60"
          >
            {trustLine}
          </motion.p>
        )}
      </div>

      {/* Search bar — sits directly on the image, Compass-style */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
        onSubmit={handleSubmit}
        className="absolute inset-x-0 bottom-0 z-10"
      >
        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md sm:p-4">
            <div className="flex gap-1.5">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPropertyType(type)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    propertyType === type
                      ? "bg-white text-navy-900"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Location"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white [&>option]:text-navy-900 sm:w-56 focus:border-gold-400 focus:outline-none"
              >
                <option>North Cebu</option>
                <option>Central Cebu</option>
                <option>South Cebu</option>
              </select>
              <input
                type="text"
                placeholder="Search by address, community, or listing ID..."
                className="w-full flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-gold-400 focus:outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-navy-950 transition-colors hover:bg-gold-400"
              >
                <Search size={16} /> Search
              </motion.button>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  );
}

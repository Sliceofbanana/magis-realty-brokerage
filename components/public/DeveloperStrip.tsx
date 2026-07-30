import Image from "next/image";
import { developerPartners } from "@/lib/data/misc";

export function DeveloperStrip() {
  return (
    <section className="border-y border-black/5 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gold-600">
          Partnered With World-Class Developers
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {developerPartners.map((partner) => (
            <div key={partner.name} className="relative h-12 w-32">
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                sizes="130px"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

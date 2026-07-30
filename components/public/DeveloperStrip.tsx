import Image from "next/image";
import { developerPartners } from "@/lib/data/misc";

export function DeveloperStrip() {
  const track = [...developerPartners, ...developerPartners];

  return (
    <section className="border-y border-black/5 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gold-600">
          Partnered With World-Class Developers
        </p>

        <div
          className="group relative mt-8 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="animate-marquee flex w-max items-center gap-16 group-hover:[animation-play-state:paused]">
            {track.map((partner, i) => (
              <div
                key={`${partner.name}-${i}`}
                className="relative h-24 w-56 shrink-0 sm:h-28 sm:w-64"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  sizes="256px"
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

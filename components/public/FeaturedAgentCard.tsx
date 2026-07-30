import Image from "next/image";
import Link from "next/link";
import { Award } from "lucide-react";
import { Agent } from "@/lib/types";

export function FeaturedAgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="group relative block h-72 overflow-hidden rounded-2xl sm:h-80"
    >
      <Image
        src={agent.photo}
        alt={agent.name}
        fill
        sizes="(min-width: 1024px) 33vw, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <span className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide">
          <Award size={12} /> Top Performer
        </span>
        <h3 className="mt-3 font-serif text-xl font-bold">{agent.name}</h3>
        <p className="text-sm text-white/80">{agent.title}</p>
        <p className="mt-1 text-xs text-white/60">
          {agent.yearsExperience} Years Experience &bull; {agent.activeListings} Active Listings
        </p>
      </div>
    </Link>
  );
}

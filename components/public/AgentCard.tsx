import Image from "next/image";
import Link from "next/link";
import { Mail, BadgeCheck } from "lucide-react";
import { Agent } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/agents/${agent.slug}`} className="relative block h-56 w-full overflow-hidden">
        <Image
          src={agent.photo}
          alt={agent.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {agent.verified && (
          <div className="absolute left-3 top-3">
            <Badge tone="green">
              <BadgeCheck size={12} /> Verified
            </Badge>
          </div>
        )}
      </Link>
      <div className="p-5">
        <Link href={`/agents/${agent.slug}`}>
          <h3 className="font-serif text-lg font-bold text-navy-900">{agent.name}</h3>
        </Link>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gold-600">
          {agent.title}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-black/5 pt-4 text-xs">
          <div>
            <p className="text-gray-500">Experience</p>
            <p className="font-semibold text-navy-900">{agent.yearsExperience} Years</p>
          </div>
          <div>
            <p className="text-gray-500">Active Listings</p>
            <p className="font-semibold text-navy-900">{agent.activeListings} Properties</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button href={`/agents/${agent.slug}`} size="sm" className="flex-1">
            Contact Agent
          </Button>
          <a
            href={`mailto:${agent.email}`}
            aria-label={`Email ${agent.name}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-black/10 text-navy-900 hover:bg-navy-900/5"
          >
            <Mail size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

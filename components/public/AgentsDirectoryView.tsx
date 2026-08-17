"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Agent } from "@/lib/types";
import { AgentCard } from "@/components/public/AgentCard";
import { FeaturedAgentCard } from "@/components/public/FeaturedAgentCard";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 8;

export function AgentsDirectoryView({ agents }: { agents: Agent[] }) {
  const [query, setQuery] = useState("");
  const [specialization, setSpecialization] = useState("All Specializations");
  const [page, setPage] = useState(1);

  const featured = agents.filter((a) => a.topPerformer);
  const specializations = ["All Specializations", ...new Set(agents.map((a) => a.specialization))];

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      const matchesQuery =
        !query ||
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.specialization.toLowerCase().includes(query.toLowerCase());
      const matchesSpecialization =
        specialization === "All Specializations" || a.specialization === specialization;
      return matchesQuery && matchesSpecialization;
    });
  }, [agents, query, specialization]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-navy-900 sm:text-4xl">
          You May Contact Our Agents
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Connect with the industry&rsquo;s most distinguished real estate
          professionals. Our agents bring architectural insight and investment
          precision to every transaction.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {featured.map((agent) => (
            <FeaturedAgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by agent name or specialization..."
              className="w-full rounded-lg border border-black/10 bg-white py-3 pl-11 pr-4 text-sm text-navy-900 shadow-sm focus:border-navy-900 focus:outline-none"
            />
          </div>
          <select
            value={specialization}
            onChange={(e) => {
              setSpecialization(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-navy-900 shadow-sm"
          >
            {specializations.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <Button variant="outline">
            <SlidersHorizontal size={14} /> Filters
          </Button>
        </div>

        <div className="mt-10">
          <h2 className="font-serif text-2xl font-bold text-navy-900">Directory of Agents</h2>
          <p className="mt-1 text-sm text-gray-500">
            Showing {filtered.length} specialized agents
          </p>

          {paged.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-black/10 p-12 text-center text-sm text-gray-500">
              No agents match your search.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {paged.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </div>
      </div>

      <section className="bg-sky-100 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-navy-900">
            Join our network of elite brokers.
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            We are always looking for driven, architectural-minded individuals
            to join our prestigious collective of agents. Unlock access to
            exclusive listings and high-net-worth clientele.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/careers">Apply to Join</Button>
            <Button href="/about" variant="outline">
              Our Culture
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

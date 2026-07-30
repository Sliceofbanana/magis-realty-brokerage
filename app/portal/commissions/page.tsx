"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Plus, TrendingUp, Filter } from "lucide-react";
import { transactions } from "@/lib/data/transactions";
import { PageHeader } from "@/components/portal/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency } from "@/lib/format";

const statusTone = { Paid: "green", Pending: "gold", "In Review": "blue" } as const;

export default function CommissionsAdminPage() {
  const [quarter, setQuarter] = useState("All Quarters");

  return (
    <div>
      <PageHeader
        title="Commissions Overview"
        description="Track your earnings and pending payouts for the current fiscal period."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download size={14} /> Export PDF
            </Button>
            <Button size="sm">
              <Plus size={14} /> New Transaction
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-2xl bg-navy-950 p-6 text-white">
          <p className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
            Total Commissions Earned
          </p>
          <p className="mt-2 font-serif text-3xl font-bold">$412,850.00</p>
          <span className="mt-4 inline-flex items-center gap-1 rounded bg-gold-500/20 px-2 py-1 text-xs font-semibold text-gold-300">
            <TrendingUp size={12} /> +12.4% vs last fiscal year
          </span>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Pending Payouts</p>
          <p className="mt-2 font-serif text-3xl font-bold text-navy-900">$58,200.00</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              <Avatar initials="JD" size={28} />
              <Avatar initials="AL" size={28} />
            </div>
            <span className="text-xs text-gray-400">Expected within 14 days</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-6">
          <h2 className="font-serif text-lg font-bold text-navy-900">Recent Transactions</h2>
          <div className="flex items-center gap-2">
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="rounded-lg border border-black/10 bg-offwhite px-3 py-2 text-xs text-navy-900"
            >
              {["All Quarters", "Q1", "Q2", "Q3", "Q4"].map((q) => (
                <option key={q}>{q}</option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Filter"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-gray-500"
            >
              <Filter size={14} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3 font-medium">Property Name</th>
                <th className="px-6 py-3 font-medium">Sale Price</th>
                <th className="px-6 py-3 font-medium">Comm. %</th>
                <th className="px-6 py-3 font-medium">Commission</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t border-black/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                        <Image src={t.image} alt={t.property} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-navy-900">{t.property}</p>
                        <p className="text-xs text-gray-400">{t.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-navy-900">{formatCurrency(t.salePrice)}</td>
                  <td className="px-6 py-4 text-navy-900">{t.commissionPercent}%</td>
                  <td className="px-6 py-4 font-semibold text-navy-900">
                    {formatCurrency(t.commissionAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={statusTone[t.status]}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 text-xs text-gray-400">
          Showing 1-{transactions.length} of {transactions.length} transactions
        </div>
      </div>
    </div>
  );
}

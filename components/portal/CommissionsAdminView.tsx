"use client";

import { useMemo, useState } from "react";
import { Download, TrendingUp, Building2 } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CreateCommissionForm } from "@/components/portal/CreateCommissionForm";
import { formatCurrency } from "@/lib/format";
import type { Transaction } from "@/lib/types";

const statusTone = { Paid: "green", Pending: "gold", "In Review": "blue" } as const;

type AgentOption = { id: string; name: string; role: string };
type PropertyOption = { id: string; title: string; price: number };

function quarterOf(dateIso: string) {
  const month = Number(dateIso.slice(5, 7));
  return `Q${Math.ceil(month / 3)}`;
}

function exportTransactionsPdf(rows: Transaction[]) {
  Promise.all([import("jspdf"), import("jspdf-autotable")]).then(([{ default: jsPDF }, { default: autoTable }]) => {
    const doc = new jsPDF();
    doc.text("Commissions Report", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Property", "Location", "Sale Price", "Comm. %", "Commission", "Status"]],
      body: rows.map((t) => [
        t.property,
        t.location,
        formatCurrency(t.salePrice),
        `${t.commissionPercent}%`,
        formatCurrency(t.commissionAmount),
        t.status,
      ]),
    });
    doc.save("commissions-report.pdf");
  });
}

export function CommissionsAdminView({
  transactions,
  totalEarned,
  remaining,
  agents,
  properties,
}: {
  transactions: Transaction[];
  totalEarned: number;
  remaining: number;
  agents: AgentOption[];
  properties: PropertyOption[];
}) {
  const [quarter, setQuarter] = useState("All Quarters");

  const filtered = useMemo(() => {
    if (quarter === "All Quarters") return transactions;
    return transactions.filter((t) => quarterOf(t.closedDate) === quarter);
  }, [transactions, quarter]);

  return (
    <div>
      <PageHeader
        title="Commissions Overview"
        description="Track your earnings and pending payouts for the current fiscal period."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportTransactionsPdf(filtered)}>
              <Download size={14} /> Export PDF
            </Button>
            <CreateCommissionForm agents={agents} properties={properties} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-2xl bg-navy-950 p-6 text-white">
          <p className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
            Total Commissions Earned
          </p>
          <p className="mt-2 font-serif text-3xl font-bold">{formatCurrency(totalEarned)}</p>
          <span className="mt-4 inline-flex items-center gap-1 rounded bg-gold-500/20 px-2 py-1 text-xs font-semibold text-gold-300">
            <TrendingUp size={12} /> {transactions.length} recorded transaction{transactions.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Pending Payouts</p>
          <p className="mt-2 font-serif text-3xl font-bold text-navy-900">{formatCurrency(remaining)}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              {agents.slice(0, 2).map((a) => (
                <Avatar key={a.id} initials={a.name.slice(0, 2).toUpperCase()} size={28} />
              ))}
            </div>
            <span className="text-xs text-gray-400">Awaiting release</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-6">
          <h2 className="font-serif text-lg font-bold text-navy-900">Recent Transactions</h2>
          <select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="rounded-lg border border-black/10 bg-offwhite px-3 py-2 text-xs text-navy-900"
          >
            {["All Quarters", "Q1", "Q2", "Q3", "Q4"].map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>
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
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-black/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
                        <Building2 size={18} />
                      </span>
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 text-xs text-gray-400">
          Showing 1-{filtered.length} of {filtered.length} transactions
        </div>
      </div>
    </div>
  );
}

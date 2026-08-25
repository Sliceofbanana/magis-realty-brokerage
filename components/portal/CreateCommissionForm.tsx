"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createCommissionRecordAction, type CommissionActionResult } from "@/lib/actions/commissions";
import { getCommissionRules, type CommissionRules } from "@/lib/actions/commissionRules";
import { computeCommissionSplit } from "@/lib/commissions";
import { formatCurrency } from "@/lib/format";

type AgentOption = { id: string; name: string; role: string };
type PropertyOption = { id: string; title: string; price: number };

export function CreateCommissionForm({
  agents,
  properties,
}: {
  agents: AgentOption[];
  properties: PropertyOption[];
}) {
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState<CommissionRules | null>(null);
  const [propertyId, setPropertyId] = useState("");
  const [propertyLabel, setPropertyLabel] = useState("");
  const [salePrice, setSalePrice] = useState<number | "">("");
  const [commissionPercent, setCommissionPercent] = useState<number | "">(3);

  const [state, formAction, pending] = useActionState<CommissionActionResult, FormData>(
    createCommissionRecordAction,
    null as unknown as CommissionActionResult
  );

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) setOpen(false);
  }

  useEffect(() => {
    if (open && !rules) getCommissionRules().then(setRules);
  }, [open, rules]);

  const breakdown = useMemo(() => {
    if (!rules || !salePrice || !commissionPercent) return null;
    return computeCommissionSplit(Number(salePrice), Number(commissionPercent), rules);
  }, [rules, salePrice, commissionPercent]);

  function selectProperty(id: string) {
    setPropertyId(id);
    const property = properties.find((p) => p.id === id);
    if (property) {
      setPropertyLabel(property.title);
      setSalePrice(property.price);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={14} /> New Transaction
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-commission-title"
          className="fixed inset-0 z-100 flex items-center justify-center bg-navy-950/70 p-4"
        >
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <h2 id="create-commission-title" className="font-serif text-lg font-bold text-navy-900">
                New Transaction
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-navy-900"
              >
                <X size={20} />
              </button>
            </div>

            <form action={formAction} className="space-y-4 px-6 py-5">
              <div>
                <label htmlFor="agentId" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Agent
                </label>
                <select
                  id="agentId"
                  name="agentId"
                  defaultValue=""
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                >
                  <option value="" disabled>
                    Select an agent
                  </option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="propertyPicker" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Linked Listing (optional — auto-fills sale price)
                </label>
                <select
                  id="propertyPicker"
                  value={propertyId}
                  onChange={(e) => selectProperty(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                >
                  <option value="">Not linked to a listing</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="propertyLabel" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Property Name
                </label>
                <input
                  id="propertyLabel"
                  name="propertyLabel"
                  value={propertyLabel}
                  onChange={(e) => setPropertyLabel(e.target.value)}
                  placeholder="The Grand Residences, Unit 42B"
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
                <input type="hidden" name="propertyId" value={propertyId} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="closedDate" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Closed Date
                  </label>
                  <input
                    id="closedDate"
                    name="closedDate"
                    type="date"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="salePrice" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Sale Price
                  </label>
                  <input
                    id="salePrice"
                    name="salePrice"
                    type="number"
                    min={0}
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="commissionPercent" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Commission %
                  </label>
                  <input
                    id="commissionPercent"
                    name="commissionPercent"
                    type="number"
                    min={0}
                    step="0.1"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-offwhite p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Payout Breakdown (from Commission Rules)
                </p>
                {!rules ? (
                  <p className="mt-2 text-sm text-gray-400">Loading rules…</p>
                ) : !breakdown ? (
                  <p className="mt-2 text-sm text-gray-400">Enter a sale price and commission % to preview.</p>
                ) : (
                  <div className="mt-2 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gross commission</span>
                      <span className="font-semibold text-navy-900">{formatCurrency(breakdown.grossCommission)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Agent split ({breakdown.agentSplitPercent}%
                        {breakdown.tierBonusApplied ? " — tier bonus applied" : ""})
                      </span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(breakdown.agentEarned)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Est. withholding tax</span>
                      <span>{formatCurrency(breakdown.estimatedWithholdingTax)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Transaction fee</span>
                      <span>{formatCurrency(breakdown.transactionFee)}</span>
                    </div>
                  </div>
                )}
              </div>

              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Saving…" : "Save Transaction"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

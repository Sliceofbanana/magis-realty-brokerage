"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Info, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type Tone = "good" | "warn" | "bad" | "neutral";

const pillTones: Record<Tone, string> = {
  good: "bg-emerald-100 text-emerald-700",
  warn: "bg-amber-100 text-amber-700",
  bad: "bg-red-100 text-red-700",
  neutral: "bg-gray-100 text-gray-600",
};

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${pillTones[tone]}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function Card({
  icon,
  title,
  description,
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-navy-700">{icon}</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-lg font-bold text-navy-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Label / value pairs as a definition list. */
export function Rows({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-black/5 rounded-xl border border-black/5">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3">
          <dt className="text-sm text-gray-500">{r.label}</dt>
          <dd className="min-w-0 text-sm font-semibold text-navy-900">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "bad"; children: ReactNode }) {
  const styles = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    bad: "border-red-200 bg-red-50 text-red-700",
  }[tone];
  const Icon = tone === "info" ? Info : TriangleAlert;
  return (
    <div role={tone === "bad" ? "alert" : undefined} className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${styles}`}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[i]}`;
}

/** Hands a CSV string to the browser as a file download. */
export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Loads a panel's data when it first appears and lets it be refreshed. `load`
 * must be a stable reference (a server action import is). While refreshing,
 * the previous data stays on screen.
 */
export function useLoader<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    load()
      .then((result) => {
        if (!live) return;
        setData(result);
        setError(null);
      })
      .catch(() => {
        if (live) setError("Couldn't load this section.");
      })
      .finally(() => {
        if (live) setRefreshing(false);
      });
    return () => {
      live = false;
    };
  }, [load, tick]);

  const reload = useCallback(() => {
    setRefreshing(true);
    setTick((t) => t + 1);
  }, []);

  return { data, error, loading: data === null && error === null, refreshing, reload };
}

export type Loader<T> = ReturnType<typeof useLoader<T>>;

export function RefreshButton({ loader, label = "Refresh" }: { loader: Pick<Loader<unknown>, "reload" | "refreshing">; label?: string }) {
  return (
    <Button variant="outline" size="sm" onClick={loader.reload} disabled={loader.refreshing} aria-busy={loader.refreshing}>
      <RefreshCw size={13} className={loader.refreshing ? "animate-spin" : ""} aria-hidden="true" />
      {loader.refreshing ? "Checking…" : label}
    </Button>
  );
}

/** Shows loading and error states, and the panel body once data has arrived. */
export function LoaderGate<T>({ loader, children }: { loader: Loader<T>; children: (data: T) => ReactNode }) {
  if (loader.loading) {
    return (
      <p role="status" className="rounded-2xl border border-black/5 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
        Loading…
      </p>
    );
  }
  if (!loader.data) {
    return (
      <Notice tone="bad">
        {loader.error ?? "Couldn't load this section."}{" "}
        <button type="button" onClick={loader.reload} className="font-semibold underline">
          Try again
        </button>
      </Notice>
    );
  }
  return (
    <div className="space-y-6">
      {loader.error && (
        <Notice tone="warn">
          Couldn&rsquo;t refresh, so this may be out of date.{" "}
          <button type="button" onClick={loader.reload} className="font-semibold underline">
            Try again
          </button>
        </Notice>
      )}
      {children(loader.data)}
    </div>
  );
}

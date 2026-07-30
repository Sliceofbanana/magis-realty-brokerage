import { ReactNode } from "react";

export function StatCard({
  icon,
  label,
  value,
  iconBg = "bg-sky-100 text-navy-700",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  iconBg?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
      >
        {icon}
      </span>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-navy-900">{value}</p>
      </div>
    </div>
  );
}

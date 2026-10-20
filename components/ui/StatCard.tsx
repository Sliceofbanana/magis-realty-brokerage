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
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:gap-4 sm:p-5">
      <span
        className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl min-[340px]:flex ${iconBg}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="break-words text-xl font-bold text-navy-900 sm:text-2xl">{value}</p>
      </div>
    </div>
  );
}

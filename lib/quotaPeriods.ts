import type { QuotaPeriod } from "@/lib/types";

const DAY = 86_400_000;
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/**
 * The current weekly (Mon–Sun), monthly, and quarterly quota cycles, derived
 * from today's date in Manila time — so the leaderboard always reflects the
 * real current period instead of a hard-coded one.
 */
export function currentQuotaPeriods(now: Date = new Date()): QuotaPeriod[] {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(now); // YYYY-MM-DD
  const [y, m, d] = today.split("-").map(Number);
  const todayMs = Date.UTC(y, m - 1, d);

  // Weekly: Monday → Sunday containing today.
  const dow = new Date(todayMs).getUTCDay(); // 0 = Sunday
  const weekStart = todayMs - ((dow + 6) % 7) * DAY;
  const weekEnd = weekStart + 6 * DAY;
  const ws = new Date(weekStart);
  const we = new Date(weekEnd);
  const weekLabel =
    ws.getUTCMonth() === we.getUTCMonth()
      ? `Week of ${MONTHS_SHORT[ws.getUTCMonth()]} ${ws.getUTCDate()} – ${we.getUTCDate()}, ${we.getUTCFullYear()}`
      : `Week of ${MONTHS_SHORT[ws.getUTCMonth()]} ${ws.getUTCDate()} – ${MONTHS_SHORT[we.getUTCMonth()]} ${we.getUTCDate()}, ${we.getUTCFullYear()}`;

  // Monthly.
  const monthStart = Date.UTC(y, m - 1, 1);
  const monthEnd = Date.UTC(y, m, 0);

  // Quarterly.
  const q = Math.floor((m - 1) / 3);
  const quarterStart = Date.UTC(y, q * 3, 1);
  const quarterEnd = Date.UTC(y, q * 3 + 3, 0);

  return [
    { id: "weekly", label: "Weekly", cycleLabel: weekLabel, start: iso(weekStart), end: iso(weekEnd), asOf: today },
    {
      id: "monthly",
      label: "Monthly",
      cycleLabel: `${MONTHS_LONG[m - 1]} ${y} Cycle`,
      start: iso(monthStart),
      end: iso(monthEnd),
      asOf: today,
    },
    {
      id: "quarterly",
      label: "Quarterly",
      cycleLabel: `Q${q + 1} ${y} Performance Cycle`,
      start: iso(quarterStart),
      end: iso(quarterEnd),
      asOf: today,
    },
  ];
}

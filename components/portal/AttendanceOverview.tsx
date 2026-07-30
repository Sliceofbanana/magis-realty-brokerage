import {
  CalendarCheck2,
  GraduationCap,
  Trophy,
  Medal,
  Flame,
  Lock,
  CalendarClock,
  History,
} from "lucide-react";
import { attendanceConfig, attendanceSessions } from "@/lib/data/attendance";
import {
  attendanceSummary,
  formatSessionDate,
  AttendanceBadge,
  TypeStats,
} from "@/lib/attendance";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Badge } from "@/components/ui/Badge";

const badgeConfig: Record<AttendanceBadge, { label: string; tone: "green" | "gold" | "red" }> = {
  excellent: { label: "Excellent Attendance", tone: "green" },
  good: { label: "Good Attendance", tone: "gold" },
  "needs-improvement": { label: "Needs Improvement", tone: "red" },
};

function TypeCard({
  title,
  icon,
  stats,
}: {
  title: string;
  icon: React.ReactNode;
  stats: TypeStats;
}) {
  const badge = badgeConfig[stats.badge];
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-navy-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-navy-700">
            {icon}
          </span>
          {title}
        </h3>
        <Badge tone={badge.tone}>{badge.label}</Badge>
      </div>

      <div className="mt-5 flex items-center gap-6">
        <ProgressRing percent={Math.round(stats.rate)} size={96} stroke={9} />
        <div className="flex-1 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Scheduled</span>
            <span className="font-semibold text-navy-900">{stats.scheduled}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Attended</span>
            <span className="font-semibold text-emerald-600">{stats.attended}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Missed</span>
            <span className="font-semibold text-red-500">{stats.missed}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-navy-900">
          <Flame size={16} className="text-gold-500" />
          {stats.currentStreak}-session streak
        </span>
        {stats.nextUpcoming && (
          <span className="text-xs text-gray-400">
            Next: {formatSessionDate(stats.nextUpcoming.date)}
          </span>
        )}
      </div>
    </div>
  );
}

export function AttendanceOverview() {
  const summary = attendanceSummary(attendanceSessions, attendanceConfig);
  const { meetings, pks, nextTier } = summary;
  const overallBadge = badgeConfig[summary.overallBadge];

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-navy-900">Attendance Performance</h2>
          <p className="mt-1 text-sm text-gray-500">
            Meetings &amp; Product Knowledge Seminars &bull; {attendanceConfig.periodLabel}
          </p>
        </div>
        <Badge tone={summary.eligible ? "green" : "red"}>
          {summary.eligible
            ? `Reward Eligible — ${Math.round(summary.overallRate)}% attendance`
            : `Below ${attendanceConfig.eligibilityMinRate}% requirement`}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TypeCard title="Meetings" icon={<CalendarCheck2 size={18} />} stats={meetings} />
        <TypeCard title="PKS Sessions" icon={<GraduationCap size={18} />} stats={pks} />

        <div className="rounded-2xl bg-navy-950 p-6 text-white shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-serif text-lg font-bold">
              <Trophy size={18} className="text-gold-400" /> Attendance Rewards
            </h3>
            <Badge tone={overallBadge.tone}>{Math.round(summary.overallRate)}%</Badge>
          </div>

          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/50">Current Points</p>
              <p className="font-serif text-3xl font-bold text-gold-400">
                {summary.totalPoints} <span className="text-base font-normal">pts</span>
              </p>
            </div>
            {nextTier && (
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wide text-white/50">Next Reward</p>
                <p className="font-serif text-lg font-bold">
                  {nextTier.label} &bull; {nextTier.points} pts
                </p>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-white/15"
              role="progressbar"
              aria-valuenow={Math.round(summary.progressToNextPct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-gold-500"
                style={{ width: `${summary.progressToNextPct}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs font-bold">
              {Math.round(summary.progressToNextPct)}%
            </p>
          </div>

          <p className="text-sm text-white/80">
            {nextTier
              ? `Only ${summary.pksNeeded} more PKS session${summary.pksNeeded === 1 ? "" : "s"} — or ${summary.meetingsNeeded} meetings — to unlock your ${nextTier.label} reward!`
              : "All reward tiers unlocked — legendary attendance!"}
          </p>

          <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
            {[...attendanceConfig.rewardTiers]
              .sort((a, b) => a.points - b.points)
              .map((tier) => {
                const earned = summary.totalPoints >= tier.points;
                const isNext = nextTier?.points === tier.points;
                return (
                  <span
                    key={tier.label}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold ${
                      earned
                        ? "bg-gold-500 text-white"
                        : isNext
                          ? "border border-gold-400/60 text-gold-400"
                          : "border border-white/10 text-white/40"
                    }`}
                  >
                    {earned ? <Medal size={13} /> : isNext ? <Trophy size={13} /> : <Lock size={13} />}
                    {tier.label} {tier.points}
                  </span>
                );
              })}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_200px_260px]">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-offwhite p-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-400">
                Meetings This Month
              </p>
              <p className="mt-1 font-serif text-2xl font-bold text-navy-900">
                {meetings.attendedThisMonth}
              </p>
            </div>
            <div className="rounded-xl bg-offwhite p-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-400">PKS This Month</p>
              <p className="mt-1 font-serif text-2xl font-bold text-navy-900">
                {pks.attendedThisMonth}
              </p>
            </div>
            <div className="rounded-xl bg-offwhite p-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-400">Longest Streak</p>
              <p className="mt-1 flex items-center gap-1.5 font-serif text-2xl font-bold text-navy-900">
                <Flame size={18} className="text-gold-500" /> {summary.longestStreak}
              </p>
            </div>
            <div className="rounded-xl bg-offwhite p-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-400">Last Attended</p>
              <p className="mt-1 text-sm font-semibold leading-snug text-navy-900">
                {summary.lastAttended
                  ? `${summary.lastAttended.title}`
                  : "—"}
              </p>
              {summary.lastAttended && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                  <History size={12} /> {formatSessionDate(summary.lastAttended.date)}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Monthly Trend
            </p>
            <div className="mt-3 flex h-28 items-end gap-3">
              {summary.monthlyTrend.map((month) => (
                <div key={month.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-xs font-bold text-navy-900">{Math.round(month.rate)}%</span>
                  <div className="flex h-full w-full items-end overflow-hidden rounded-t-md bg-offwhite">
                    <div
                      className="w-full rounded-t-md bg-gold-500"
                      style={{ height: `${month.rate}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-400">{month.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Upcoming Sessions
            </p>
            <ul className="mt-3 space-y-3">
              {[meetings.nextUpcoming, pks.nextUpcoming]
                .filter((s): s is NonNullable<typeof s> => Boolean(s))
                .map((session) => (
                  <li key={session.id} className="flex items-start gap-3 rounded-xl bg-offwhite p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
                      <CalendarClock size={14} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold leading-snug text-navy-900">
                        {session.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {formatSessionDate(session.date)} &bull;{" "}
                        {session.type === "meeting" ? "Meeting" : "PKS"}
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

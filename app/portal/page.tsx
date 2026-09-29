import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Tag,
  Users,
  CalendarDays,
  MoreVertical,
  PlusCircle,
  Pencil,
  Eye,
  ChevronRight,
  UserPlus2,
  FileEdit,
  CheckCircle2,
  ClipboardCheck,
  UserCog,
  ShieldAlert,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { AttendanceOverview } from "@/components/portal/AttendanceOverview";
import { CommissionProgress } from "@/components/portal/CommissionProgress";
import { BirthdayBanner } from "@/components/portal/BirthdayBanner";
import { TodaysBirthdaysWidget } from "@/components/portal/TodaysBirthdaysWidget";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { exteriors } from "@/lib/stockPhotos";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/format";
import {
  attendanceConfigWithTiers,
  attendanceRecordWithMeeting,
  fallbackAttendanceConfig,
  toAttendanceConfig,
  toAttendanceSessions,
} from "@/lib/adapters/attendance";
import { leadStatusLabel, leadStatusTone } from "@/lib/adapters/lead";
import { commissionRecordInclude, toCommissionRecord } from "@/lib/adapters/commission";
import type { AttendanceSession } from "@/lib/types";

const activityIcons = [UserPlus2, FileEdit, CheckCircle2];

export default async function PortalDashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Agent";
  const isAdmin = session?.user?.role === "ADMINISTRATOR";

  const [
    activeListings,
    soldProperties,
    totalLeads,
    recentLeads,
    recentActivityEntries,
    attendanceConfigRow,
    myAttendanceRecords,
    myCommissionRecords,
    pendingApprovals,
    unassignedAgents,
  ] = await Promise.all([
    prisma.property.count({ where: { status: { not: "SOLD" }, archived: false } }),
    prisma.property.count({ where: { status: "SOLD", archived: false } }),
    prisma.lead.count(),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { property: { select: { title: true } } },
    }),
    prisma.activityLogEntry.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.attendanceConfig.findUnique({
      where: { id: "singleton" },
      include: attendanceConfigWithTiers,
    }),
    session?.user?.id
      ? prisma.attendanceRecord.findMany({
          where: { agentId: session.user.id },
          include: attendanceRecordWithMeeting,
        })
      : Promise.resolve([]),
    session?.user?.id
      ? prisma.commissionRecord.findMany({
          where: { agentId: session.user.id },
          include: commissionRecordInclude,
          orderBy: { closedDate: "desc" },
        })
      : Promise.resolve([]),
    isAdmin
      ? prisma.user.findMany({
          where: { status: "PENDING" },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    isAdmin
      ? prisma.agentProfile.findMany({
          where: { teamId: null },
          orderBy: { user: { name: "asc" } },
          select: { user: { select: { id: true, name: true } } },
        })
      : Promise.resolve([]),
  ]);

  const pendingApprovalsCount = pendingApprovals.length;
  const unassignedAgentsCount = unassignedAgents.length;

  const attentionItems = [
    ...pendingApprovals.map((u) => ({
      key: `pending-${u.id}`,
      label: u.name,
      note: "Pending approval",
      href: "/portal/users",
    })),
    ...unassignedAgents.map((a) => ({
      key: `unassigned-${a.user.id}`,
      label: a.user.name,
      note: "No team assigned",
      href: "/portal/teams",
    })),
  ].slice(0, 6);

  const attendanceConfig = attendanceConfigRow
    ? toAttendanceConfig(attendanceConfigRow)
    : fallbackAttendanceConfig;
  const attendanceSessions: AttendanceSession[] = toAttendanceSessions(myAttendanceRecords);
  const commissionRecords = myCommissionRecords.map(toCommissionRecord);

  return (
    <div>
      <BirthdayBanner />

      <h1 className="font-serif text-3xl font-bold text-navy-900">
        Welcome back, {firstName}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Here&rsquo;s what&rsquo;s happening today.</p>

      {isAdmin && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/portal/users"
            className={`flex items-center justify-between rounded-2xl border p-5 shadow-sm transition-colors ${
              pendingApprovalsCount > 0
                ? "border-gold-300 bg-gold-50/40 hover:bg-gold-50"
                : "border-black/5 bg-white hover:bg-offwhite"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  pendingApprovalsCount > 0 ? "bg-gold-100 text-gold-600" : "bg-sky-100 text-navy-700"
                }`}
              >
                <ClipboardCheck size={18} />
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Pending Approvals</p>
                <p className="font-serif text-xl font-bold text-navy-900">{pendingApprovalsCount}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
          <Link
            href="/portal/teams"
            className={`flex items-center justify-between rounded-2xl border p-5 shadow-sm transition-colors ${
              unassignedAgentsCount > 0
                ? "border-gold-300 bg-gold-50/40 hover:bg-gold-50"
                : "border-black/5 bg-white hover:bg-offwhite"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  unassignedAgentsCount > 0 ? "bg-gold-100 text-gold-600" : "bg-sky-100 text-navy-700"
                }`}
              >
                <UserCog size={18} />
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Unassigned Agents</p>
                <p className="font-serif text-xl font-bold text-navy-900">{unassignedAgentsCount}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Building2 size={20} />} label="Active Listings" value={activeListings} iconBg="bg-sky-100 text-navy-700" />
        <StatCard icon={<Tag size={20} />} label="Sold Properties" value={soldProperties} iconBg="bg-gold-100 text-gold-600" />
        <StatCard icon={<Users size={20} />} label="Total Leads" value={totalLeads} iconBg="bg-sky-100 text-navy-700" />
        <StatCard icon={<CalendarDays size={20} />} label="Appointments" value={3} iconBg="bg-red-100 text-red-600" />
      </div>

      <AttendanceOverview sessions={attendanceSessions} config={attendanceConfig} />

      <CommissionProgress records={commissionRecords} />

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <h2 className="font-serif text-lg font-bold text-navy-900">Recent Inquiries</h2>
          <Link href="/portal/leads" className="text-xs font-semibold text-navy-900 hover:text-gold-600">
            View All Leads
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3 font-medium">Client Name</th>
                <th className="px-6 py-3 font-medium">Property</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {recentLeads.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-gray-400">
                    No inquiries yet.
                  </td>
                </tr>
              )}
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="border-t border-black/5">
                  <td className="px-6 py-4 font-semibold text-navy-900">{lead.name}</td>
                  <td className="px-6 py-4 text-navy-700">
                    {lead.property?.title ?? lead.propertyLabel ?? "General Inquiry"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={leadStatusTone[lead.status]}>{leadStatusLabel[lead.status]}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-400">
                    <MoreVertical size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-navy-900">Quick Actions</h2>
            <div className="mt-4 space-y-3">
              <Link
                href="/portal/listings"
                className="flex items-center justify-between rounded-lg bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle size={16} /> Add Property
                </span>
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/portal/settings"
                className="flex items-center justify-between rounded-lg bg-gold-500 px-4 py-3 text-sm font-semibold text-white hover:bg-gold-600"
              >
                <span className="flex items-center gap-2">
                  <Pencil size={16} /> Edit Profile
                </span>
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/portal/leads"
                className="flex items-center justify-between rounded-lg bg-offwhite px-4 py-3 text-sm font-semibold text-navy-900 hover:bg-gray-100"
              >
                <span className="flex items-center gap-2">
                  <Eye size={16} /> View Leads
                </span>
                <ChevronRight size={16} />
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/portal/users"
                    className="flex items-center justify-between rounded-lg bg-offwhite px-4 py-3 text-sm font-semibold text-navy-900 hover:bg-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      <ClipboardCheck size={16} /> Review Applications
                    </span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link
                    href="/portal/teams"
                    className="flex items-center justify-between rounded-lg bg-offwhite px-4 py-3 text-sm font-semibold text-navy-900 hover:bg-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      <UserCog size={16} /> Manage Teams
                    </span>
                    <ChevronRight size={16} />
                  </Link>
                </>
              )}
            </div>
          </div>

          <TodaysBirthdaysWidget />

          <div className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm">
            <h2 className="font-serif text-lg font-bold text-navy-900">Profile Status</h2>
            <div className="mt-4 flex justify-center">
              <ProgressRing percent={85} />
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Almost there! Complete your bio to finish your professional profile.
            </p>
            <Link
              href="/portal/settings"
              className="mt-2 inline-block text-sm font-semibold text-gold-600 hover:underline"
            >
              Complete Now
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-navy-900">Recent Activity</h2>
          <ul className="mt-5 space-y-5">
            {recentActivityEntries.length === 0 && (
              <li className="text-sm text-gray-400">No recent activity yet.</li>
            )}
            {recentActivityEntries.map((activity, i) => {
              const Icon = activityIcons[i % activityIcons.length];
              return (
                <li key={activity.id} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-navy-700">
                    <Icon size={14} />
                  </span>
                  <div>
                    <p className="text-sm text-navy-900">{activity.action}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{timeAgo(activity.createdAt)}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          {isAdmin ? (
            <div className="mt-8 border-t border-black/5 pt-6">
              <h3 className="font-serif text-lg font-bold text-navy-900">Needs Your Attention</h3>
              {attentionItems.length === 0 ? (
                <p className="mt-3 text-sm text-gray-400">
                  Nothing pending — every application is reviewed and every agent has a team.
                </p>
              ) : (
                <ul className="mt-3 space-y-1">
                  {attentionItems.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-offwhite"
                      >
                        <span className="flex items-center gap-2.5 text-navy-900">
                          <ShieldAlert size={14} className="text-gold-500" />
                          {item.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          {item.note} <ChevronRight size={14} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="mt-8 border-t border-black/5 pt-6">
              <h3 className="font-serif text-lg font-bold text-navy-900">Top Performing Listing</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[200px_1fr]">
                <div className="relative h-40 overflow-hidden rounded-xl">
                  <Image
                    src={exteriors.whiteVillaPoolDayAlt}
                    alt="The Azure Estates"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-lg font-bold text-navy-900">The Azure Estates</p>
                      <p className="text-xs text-gray-500">Malibu Coastline &bull; $8,450,000</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-serif text-lg font-bold text-navy-900">124</p>
                      <p className="text-[11px] text-gray-400">Visits this week</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    This property has seen a 15% increase in engagement since the
                    new professional drone tour was uploaded. Featured as
                    &lsquo;Listing of the Month&rsquo; in the regional brochure.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button href="/portal/listings" size="sm">
                      Manage Listing
                    </Button>
                    <Button variant="outline" size="sm">
                      Share Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { AttendanceOverview } from "@/components/portal/AttendanceOverview";
import { CommissionProgress } from "@/components/portal/CommissionProgress";
import { BirthdayBanner } from "@/components/portal/BirthdayBanner";
import { TodaysBirthdaysWidget } from "@/components/portal/TodaysBirthdaysWidget";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { recentInquiries, recentActivity } from "@/lib/data/misc";
import { exteriors } from "@/lib/stockPhotos";

const statusTone = {
  New: "blue",
  "Follow-up": "green",
  Nurturing: "gray",
} as const;

const activityIcons = [UserPlus2, FileEdit, CheckCircle2];

export default function PortalDashboardPage() {
  return (
    <div>
      <BirthdayBanner />

      <h1 className="font-serif text-3xl font-bold text-navy-900">
        Welcome back, Agent Smith
      </h1>
      <p className="mt-1 text-sm text-gray-500">Here&rsquo;s what&rsquo;s happening today.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Building2 size={20} />} label="Active Listings" value={12} iconBg="bg-sky-100 text-navy-700" />
        <StatCard icon={<Tag size={20} />} label="Sold Properties" value={8} iconBg="bg-gold-100 text-gold-600" />
        <StatCard icon={<Users size={20} />} label="Total Leads" value={45} iconBg="bg-sky-100 text-navy-700" />
        <StatCard icon={<CalendarDays size={20} />} label="Appointments" value={3} iconBg="bg-red-100 text-red-600" />
      </div>

      <AttendanceOverview />

      <CommissionProgress />

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
              {recentInquiries.map((inquiry) => (
                <tr key={inquiry.client} className="border-t border-black/5">
                  <td className="px-6 py-4 font-semibold text-navy-900">{inquiry.client}</td>
                  <td className="px-6 py-4 text-navy-700">{inquiry.property}</td>
                  <td className="px-6 py-4">
                    <Badge tone={statusTone[inquiry.status]}>{inquiry.status}</Badge>
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
              href="/portal/profile"
              className="mt-2 inline-block text-sm font-semibold text-gold-600 hover:underline"
            >
              Complete Now
            </Link>
          </div>

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
                href="/portal/profile"
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
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-navy-900">Recent Activity</h2>
          <ul className="mt-5 space-y-5">
            {recentActivity.map((activity, i) => {
              const Icon = activityIcons[i % activityIcons.length];
              return (
                <li key={activity.title} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-navy-700">
                    <Icon size={14} />
                  </span>
                  <div>
                    <p className="text-sm text-navy-900">{activity.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{activity.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>

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
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import {
  SlidersHorizontal,
  User,
  Clock,
  Bell,
  Wallet,
  Mail,
  Phone,
  ShieldCheck,
  Monitor,
  Smartphone,
  Pencil,
  RotateCcw,
  UserX,
  UserCheck,
  Plus,
  CalendarCheck2,
  Trophy,
  KeyRound,
  Lock,
  Cake,
  PartyPopper,
} from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { portalUsers, activityLog } from "@/lib/data/users";
import { attendanceConfig } from "@/lib/data/attendance";
import { permissionDefs } from "@/lib/data/permissions";
import { useRole } from "@/components/portal/RoleContext";
import { useBirthdays } from "@/components/portal/BirthdayContext";
import { PortalRole } from "@/lib/types";
import { portraits } from "@/lib/stockPhotos";

const roleTone = {
  Administrator: "gold",
  Broker: "blue",
  Agent: "gray",
  Marketing: "navy",
} as const;

export default function SettingsPage() {
  const { role, hasPermission } = useRole();

  const tabs = [
    { id: "general", label: "General", icon: <SlidersHorizontal size={16} /> },
    ...(hasPermission("manage-users")
      ? [{ id: "users", label: "Users", icon: <User size={16} /> }]
      : []),
    ...(hasPermission("view-activity-log")
      ? [{ id: "activity", label: "Activity Log", icon: <Clock size={16} /> }]
      : []),
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    ...(hasPermission("configure-commissions")
      ? [{ id: "commission", label: "Commission Rules", icon: <Wallet size={16} /> }]
      : []),
    ...(hasPermission("configure-attendance")
      ? [{ id: "attendance", label: "Attendance Rules", icon: <CalendarCheck2 size={16} /> }]
      : []),
    ...(hasPermission("configure-birthdays")
      ? [{ id: "birthdays", label: "Birthday Celebrations", icon: <Cake size={16} /> }]
      : []),
    ...(hasPermission("manage-permissions")
      ? [{ id: "permissions", label: "Permissions", icon: <KeyRound size={16} /> }]
      : []),
  ];

  return (
    <div>
      <p className="text-xs text-gray-400">Admin &gt; Control Center &gt; System Settings</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
          System Settings
        </h1>
        {!hasPermission("manage-permissions") && (
          <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-500">
            <Lock size={12} /> Some settings are restricted to Administrators
          </span>
        )}
      </div>

      <div className="mt-6">
        <Tabs key={role} tabs={tabs}>
          {(active) => {
            if (active === "users") return <UsersTab />;
            if (active === "activity") return <ActivityTab />;
            if (active === "notifications") return <NotificationsTab />;
            if (active === "commission") return <CommissionTab />;
            if (active === "attendance") return <AttendanceTab />;
            if (active === "birthdays") return <BirthdayTab />;
            if (active === "permissions") return <PermissionsTab />;
            return <GeneralTab />;
          }}
        </Tabs>
      </div>
    </div>
  );
}

function GeneralTab() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-navy-900">Profile Information</h2>
            <Button size="sm">Save Changes</Button>
          </div>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl">
              <Image src={portraits.manCleanCutGray} alt="Profile" fill className="object-cover" />
            </div>
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name" defaultValue="Julian Thorne" />
              <Field label="Title" defaultValue="Senior Portfolio Manager" />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
              Professional Bio
            </label>
            <textarea
              rows={3}
              defaultValue="Elite partner at Magis Realty specializing in high-net-worth commercial acquisitions and luxury residential estates in the metropolitan district."
              className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-navy-900">Contact Details</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-navy-900">
                <Mail size={14} /> Primary Email Address
              </p>
              <div className="mt-1.5 flex gap-2">
                <input
                  defaultValue="j.thorne@magisrealty.com"
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900"
                />
                <Button variant="outline" size="sm">Change</Button>
              </div>
              <p className="mt-1 text-xs text-emerald-600">Verified professional email</p>
            </div>
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-navy-900">
                <Phone size={14} /> Mobile Phone Number
              </p>
              <div className="mt-1.5 flex gap-2">
                <input
                  defaultValue="+1 (555) 012-3456"
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900"
                />
                <Button variant="outline" size="sm">Change</Button>
              </div>
              <p className="mt-1 text-xs text-gray-400">Used for 2FA and client notifications</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-navy-900">Security &amp; Privacy</h2>
          <div className="mt-5 space-y-4">
            <Field label="Current Password" type="password" defaultValue="password123" />
            <Field label="New Password" type="password" placeholder="Min. 12 characters" />
            <Field label="Confirm New Password" type="password" placeholder="Re-enter password" />
            <Button variant="outline" className="w-full sm:w-auto">Update Password</Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-navy-900">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500">Secure your account with SMS</p>
            </div>
          </div>
          <Toggle defaultChecked label="Two-factor authentication" />
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-navy-900">Active Sessions</h3>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600">
                <Monitor size={16} /> macOS &bull; Chrome Browser
              </span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                CURRENT
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600">
                <Smartphone size={16} /> iPhone 14 Pro
              </span>
              <button type="button" className="text-xs font-semibold text-red-500 hover:underline">
                Revoke
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-semibold text-red-700">Danger Zone</h3>
          <p className="mt-1 text-xs text-red-600">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button type="button" className="mt-2 text-xs font-semibold text-red-700 underline">
            Deactivate Broker Account
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-navy-900">User Management</h2>
          <p className="text-sm text-gray-500">Configure global platform roles, permissions, and internal users.</p>
        </div>
        <Button size="sm">
          <Plus size={14} /> Add User
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-150 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-gray-400">
              <th className="px-6 py-3 font-medium">User Profile</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {portalUsers.map((user) => (
              <tr key={user.id} className="border-t border-black/5">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={user.initials} size={36} />
                    <div>
                      <p className="font-semibold text-navy-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge tone={roleTone[user.role]}>{user.role.toUpperCase()}</Badge>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-sm ${user.status === "Active" ? "text-emerald-600" : "text-gray-400"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-gray-300"}`} />
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3 text-gray-400">
                    <button type="button" aria-label="Edit user" className="hover:text-navy-900">
                      <Pencil size={15} />
                    </button>
                    <button type="button" aria-label="Reset password" className="hover:text-navy-900">
                      <RotateCcw size={15} />
                    </button>
                    {user.status === "Active" ? (
                      <button type="button" aria-label="Deactivate user" className="hover:text-red-600">
                        <UserX size={15} />
                      </button>
                    ) : (
                      <button type="button" aria-label="Activate user" className="text-emerald-600">
                        <UserCheck size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityTab() {
  return (
    <div>
      <div className="mb-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold text-navy-900">Activity Log</h2>
        <p className="text-sm text-gray-500">Review system activities and manage your administrative preferences.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">Module</label>
            <select className="w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2.5 text-sm text-navy-900">
              <option>All Modules</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">Action Type</label>
            <select className="w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2.5 text-sm text-navy-900">
              <option>Any Action</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button className="w-full">
              <SlidersHorizontal size={14} /> Apply Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-162.5 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Action</th>
                <th className="px-6 py-3 font-medium">Module</th>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {activityLog.map((entry) => (
                <tr key={entry.id} className="border-t border-black/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={entry.initials} size={32} />
                      <div>
                        <p className="font-semibold text-navy-900">{entry.user}</p>
                        <p className="text-xs text-gray-400">{entry.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={entry.action.includes("Failed") ? "red" : "blue"}>
                      {entry.action.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{entry.module}</td>
                  <td className="px-6 py-4 text-gray-500">{entry.timestamp}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">{entry.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-black/5 p-4 text-xs text-gray-400">
          Showing 1-{activityLog.length} of 1,284 entries
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const adminAlerts = [
    ["New Agent Registration", "Notify when a new agent signs up for the platform", true],
    ["New Property Submission", "Alert when an agent submits a new listing for review", true],
    ["New Inquiry", "Direct notifications for general brokerage inquiries", false],
  ] as const;

  const systemAlerts = [
    ["Security Warnings", "Critical alerts regarding account access and system security", true],
    ["Monthly Reports", "Automated delivery of brokerage performance summaries", true],
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-navy-900">
          <Bell size={18} className="text-gold-500" /> Notification Preferences
        </h2>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-gray-400">Admin Alerts</p>
        <div className="mt-3 space-y-3">
          {adminAlerts.map(([title, desc, checked]) => (
            <div key={title} className="flex items-center justify-between rounded-lg bg-offwhite px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-navy-900">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <Toggle defaultChecked={checked} label={title} />
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-gray-400">System Alerts</p>
        <div className="mt-3 space-y-3">
          {systemAlerts.map(([title, desc, checked]) => (
            <div key={title} className="flex items-center justify-between rounded-lg bg-offwhite px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-navy-900">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <Toggle defaultChecked={checked} label={title} />
            </div>
          ))}
        </div>
      </div>

      <div className="h-fit rounded-2xl bg-navy-950 p-6 text-white">
        <h3 className="flex items-center gap-2 font-semibold">
          <Mail size={16} className="text-gold-400" /> Delivery Channels
        </h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Email Notifications</p>
              <p className="text-xs text-white/60">Send to admin@magisrealty.com</p>
            </div>
            <Toggle defaultChecked label="Email notifications" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Push Notifications</p>
              <p className="text-xs text-white/60">Browser and mobile alerts</p>
            </div>
            <Toggle label="Push notifications" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CommissionTab() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-navy-900">Commission Structure</h2>
          <Badge tone="navy">Configuring</Badge>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-navy-900">Brokerage Split</p>
              <p className="text-xs text-gray-500">Standard percentage retained by the brokerage per transaction.</p>
            </div>
            <p className="font-serif text-xl font-bold text-gold-600">20%</p>
          </div>
          <input type="range" defaultValue={20} className="mt-3 w-full accent-gold-500" />
        </div>

        <div className="mt-6 border-t border-black/5 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-navy-900">Referral Fees</p>
              <p className="text-xs text-gray-500">Payout for external lead referrals.</p>
            </div>
            <p className="font-serif text-xl font-bold text-gold-600">10%</p>
          </div>
          <input type="range" defaultValue={10} className="mt-3 w-full accent-gold-500" />
        </div>

        <div className="mt-6 border-t border-black/5 pt-6">
          <p className="text-sm font-semibold text-navy-900">Tiered Incentives (High Volume)</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-offwhite p-4">
              <p className="text-[11px] uppercase text-gray-400">Sales Threshold (PHP)</p>
              <p className="mt-1 font-serif text-lg font-bold text-navy-900">5,000,000</p>
              <p className="mt-1 text-xs text-gray-500">Agent split increases to 85% after this amount.</p>
            </div>
            <div className="rounded-lg bg-offwhite p-4">
              <p className="text-[11px] uppercase text-gray-400">Bonus Percentage</p>
              <p className="mt-1 font-serif text-lg font-bold text-navy-900">5%</p>
              <p className="mt-1 text-xs text-gray-500">Additional bonus for top 3 monthly performers.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl bg-navy-950 p-6 text-white">
          <h3 className="flex items-center gap-2 font-semibold">
            <Wallet size={16} className="text-gold-400" /> Tax &amp; Fees
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs text-white/60">Withholding Tax (VAT)</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2">
                <input defaultValue={12} className="w-full bg-transparent text-sm text-white focus:outline-none" />
                <span className="text-sm text-white/60">%</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/60">Transaction Processing Fee</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2">
                <span className="text-sm text-white/60">₱</span>
                <input defaultValue={2500} className="w-full bg-transparent text-sm text-white focus:outline-none" />
              </div>
              <p className="mt-1 text-xs text-white/40">Flat fee per closed transaction for admin costs.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-offwhite p-6">
          <h3 className="font-semibold text-navy-900">Rule Summary</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Effective Date</span>
              <span className="font-semibold text-navy-900">Jan 01, 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Auto-Calculation</span>
              <span className="font-semibold text-gold-600">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceTab() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-navy-900">Attendance &amp; Reward Rules</h2>
          <Button size="sm">Save Rules</Button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Configure how meeting and PKS attendance is scored and rewarded. Changes apply to every
          agent&rsquo;s dashboard immediately.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-offwhite p-4">
            <p className="text-[11px] uppercase text-gray-400">Points per Meeting</p>
            <input
              defaultValue={attendanceConfig.pointsPerMeeting}
              className="mt-1 w-full bg-transparent font-serif text-lg font-bold text-navy-900 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Awarded for each attended meeting.</p>
          </div>
          <div className="rounded-lg bg-offwhite p-4">
            <p className="text-[11px] uppercase text-gray-400">Points per PKS Session</p>
            <input
              defaultValue={attendanceConfig.pointsPerPks}
              className="mt-1 w-full bg-transparent font-serif text-lg font-bold text-navy-900 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Awarded for each attended seminar.</p>
          </div>
        </div>

        <div className="mt-6 border-t border-black/5 pt-6">
          <p className="text-sm font-semibold text-navy-900">Reward Thresholds</p>
          <p className="text-xs text-gray-500">Point totals required to unlock each reward tier.</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {attendanceConfig.rewardTiers.map((tier) => (
              <div key={tier.label} className="rounded-lg bg-offwhite p-4">
                <p className="flex items-center gap-1.5 text-[11px] uppercase text-gray-400">
                  <Trophy size={12} className="text-gold-500" /> {tier.label}
                </p>
                <input
                  defaultValue={tier.points}
                  className="mt-1 w-full bg-transparent font-serif text-lg font-bold text-navy-900 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-black/5 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-navy-900">Incentive Eligibility Rate</p>
              <p className="text-xs text-gray-500">
                Minimum overall attendance rate required to qualify for incentives.
              </p>
            </div>
            <p className="font-serif text-xl font-bold text-gold-600">
              {attendanceConfig.eligibilityMinRate}%
            </p>
          </div>
          <input
            type="range"
            defaultValue={attendanceConfig.eligibilityMinRate}
            className="mt-3 w-full accent-gold-500"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl bg-navy-950 p-6 text-white">
          <h3 className="flex items-center gap-2 font-semibold">
            <CalendarCheck2 size={16} className="text-gold-400" /> Attendance Period
          </h3>
          <p className="mt-1 text-xs text-white/60">
            Points and rates reset at the start of each period.
          </p>
          <select
            defaultValue={attendanceConfig.period}
            className="mt-4 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none"
          >
            <option value="monthly" className="text-navy-900">Monthly</option>
            <option value="quarterly" className="text-navy-900">Quarterly</option>
            <option value="yearly" className="text-navy-900">Yearly</option>
          </select>
        </div>

        <div className="rounded-2xl bg-offwhite p-6">
          <h3 className="font-semibold text-navy-900">Rule Summary</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Active Period</span>
              <span className="font-semibold text-navy-900">{attendanceConfig.periodLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Meeting / PKS Points</span>
              <span className="font-semibold text-navy-900">
                {attendanceConfig.pointsPerMeeting} / {attendanceConfig.pointsPerPks} pts
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Eligibility</span>
              <span className="font-semibold text-gold-600">
                &ge;{attendanceConfig.eligibilityMinRate}% attendance
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BirthdayTab() {
  const { config, updateConfig, celebrants } = useBirthdays();

  function toggleRole(role: PortalRole) {
    updateConfig({
      notifyRoles: config.notifyRoles.includes(role)
        ? config.notifyRoles.filter((r) => r !== role)
        : [...config.notifyRoles, role],
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-navy-900">
            <Cake size={18} className="text-gold-500" /> Birthday Celebrations
          </h2>
          <Toggle
            checked={config.enabled}
            onChange={(v) => updateConfig({ enabled: v })}
            label="Enable birthday celebrations"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Control the celebration modal, team banner, and greetings shown across the portal.
        </p>

        <div className="mt-6 border-t border-black/5 pt-6">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
            Celebration Message
          </label>
          <p className="mb-2 text-xs text-gray-400">
            Shown in the celebrant&rsquo;s modal. Use <code>{"{{name}}"}</code> to insert their first
            name.
          </p>
          <textarea
            rows={3}
            value={config.messageTemplate}
            onChange={(e) => updateConfig({ messageTemplate: e.target.value })}
            className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-black/5 pt-6 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg bg-offwhite px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-navy-900">Confetti Animation</p>
              <p className="text-xs text-gray-500">Play confetti in the celebration modal.</p>
            </div>
            <Toggle
              checked={config.confettiEnabled}
              onChange={(v) => updateConfig({ confettiEnabled: v })}
              label="Confetti animation"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-offwhite px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-navy-900">Team Greetings</p>
              <p className="text-xs text-gray-500">Allow teammates to post birthday messages.</p>
            </div>
            <Toggle
              checked={config.greetingsEnabled}
              onChange={(v) => updateConfig({ greetingsEnabled: v })}
              label="Team greetings"
            />
          </div>
        </div>

        <div className="mt-6 border-t border-black/5 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-navy-900">Birthday Rewards</p>
              <p className="text-xs text-gray-500">Show a reward or voucher in the celebration modal.</p>
            </div>
            <Toggle
              checked={config.rewardsEnabled}
              onChange={(v) => updateConfig({ rewardsEnabled: v })}
              label="Birthday rewards"
            />
          </div>
          {config.rewardsEnabled && (
            <input
              value={config.rewardMessage}
              onChange={(e) => updateConfig({ rewardMessage: e.target.value })}
              className="mt-3 w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
            />
          )}
        </div>

        <div className="mt-6 border-t border-black/5 pt-6">
          <p className="text-sm font-semibold text-navy-900">Notify These Roles</p>
          <p className="text-xs text-gray-500">
            Roles that see the banner, widget, and notification bell alert.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {matrixRoles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => toggleRole(r)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  config.notifyRoles.includes(r)
                    ? "bg-navy-900 text-white"
                    : "border border-black/10 text-gray-500 hover:border-navy-900"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl bg-navy-950 p-6 text-white">
          <h3 className="flex items-center gap-2 font-semibold">
            <PartyPopper size={16} className="text-gold-400" /> Today&rsquo;s Celebrants
          </h3>
          {celebrants.length === 0 ? (
            <p className="mt-3 text-xs text-white/60">No birthdays today.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {celebrants.map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-sm">
                    🎂
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-white/60">{c.position}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-offwhite p-6">
          <h3 className="font-semibold text-navy-900">Rule Summary</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className={`font-semibold ${config.enabled ? "text-emerald-600" : "text-gray-400"}`}>
                {config.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Notified Roles</span>
              <span className="font-semibold text-navy-900">{config.notifyRoles.length} of 4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Rewards</span>
              <span className="font-semibold text-gold-600">
                {config.rewardsEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const matrixRoles: PortalRole[] = ["Administrator", "Broker", "Agent", "Marketing"];

function PermissionsTab() {
  const { matrix, togglePermission } = useRole();

  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-navy-900">Role Permissions</h2>
          <p className="text-sm text-gray-500">
            Control which capabilities each role can access. Changes apply across the portal
            immediately — use the &ldquo;Viewing as&rdquo; switcher to preview any role.
          </p>
        </div>
        <Button size="sm">Save Matrix</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-175 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-gray-400">
              <th className="px-6 py-3 font-medium">Permission</th>
              {matrixRoles.map((r) => (
                <th key={r} className="px-4 py-3 text-center font-medium">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionDefs.map((def) => (
              <tr key={def.key} className="border-t border-black/5">
                <td className="px-6 py-4">
                  <p className="font-semibold text-navy-900">{def.label}</p>
                  <p className="mt-0.5 max-w-xs text-xs text-gray-400">{def.description}</p>
                </td>
                {matrixRoles.map((r) => {
                  const locked = def.adminLocked && r === "Administrator";
                  return (
                    <td key={r} className="px-4 py-4">
                      <div className="flex justify-center">
                        <Toggle
                          checked={matrix[r].includes(def.key)}
                          onChange={() => togglePermission(r, def.key)}
                          disabled={locked}
                          label={`${def.label} for ${r}`}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-black/5 p-4 text-xs text-gray-400">
        <Lock size={12} className="mr-1 inline" />
        &ldquo;Manage Permissions&rdquo; is always retained by Administrators and cannot be revoked.
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  defaultValue,
  placeholder,
}: {
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
      />
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
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
  UserX,
  UserCheck,
  Check,
  X as XIcon,
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
import { activityLog } from "@/lib/data/users";
import { permissionDefs } from "@/lib/data/permissions";
import { useRole } from "@/components/portal/RoleContext";
import { useBirthdays } from "@/components/portal/BirthdayContext";
import { PortalRole, AttendanceConfig } from "@/lib/types";
import type { PermissionKey } from "@prisma/client";
import {
  listPortalUsers,
  approveUserAction,
  rejectUserAction,
  deactivateUserAction,
  reactivateUserAction,
  type AdminUserRow,
} from "@/lib/actions/users";
import {
  getMyProfileAction,
  updateProfileAction,
  updatePasswordAction,
  type MyProfile,
} from "@/lib/actions/profile";
import {
  listUserPermissions,
  setUserPermissionAction,
  type UserPermissionRow,
} from "@/lib/actions/permissions";
import { getAttendanceConfig, updateAttendanceConfigAction } from "@/lib/actions/attendance";
import {
  getCommissionRules,
  updateCommissionRulesAction,
  type CommissionRules,
} from "@/lib/actions/commissionRules";

const matrixRoles: PortalRole[] = ["Administrator", "Broker", "Agent", "Marketing"];

const adminRoleTone: Record<AdminUserRow["role"], "gold" | "blue" | "gray" | "navy"> = {
  ADMINISTRATOR: "gold",
  BROKER: "blue",
  AGENT: "gray",
  MARKETING: "navy",
};

const statusDisplay: Record<AdminUserRow["status"], { label: string; dot: string; text: string }> = {
  PENDING: { label: "Pending Approval", dot: "bg-amber-500", text: "text-amber-600" },
  ACTIVE: { label: "Active", dot: "bg-emerald-500", text: "text-emerald-600" },
  DEACTIVATED: { label: "Deactivated", dot: "bg-gray-300", text: "text-gray-400" },
  REJECTED: { label: "Rejected", dot: "bg-red-400", text: "text-red-500" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

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
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loadError, setLoadError] = useState("");

  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    getMyProfileAction()
      .then((p) => {
        if (!p) {
          setLoadError("Couldn't load your profile.");
          return;
        }
        setProfile(p);
        setFullName(p.name);
        setTitle(p.position ?? "");
        setPhone(p.phone ?? "");
      })
      .catch(() => setLoadError("Couldn't load your profile."));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    const result = await updateProfileAction({ name: fullName, position: title, phone });
    setSaving(false);
    if (result.error) {
      setSaveError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handlePasswordUpdate() {
    setPasswordError("");
    setPasswordMessage("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }
    setPasswordSaving(true);
    const result = await updatePasswordAction(currentPassword, newPassword);
    setPasswordSaving(false);
    if (result.error) {
      setPasswordError(result.error);
      return;
    }
    setPasswordMessage("Password updated.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  if (loadError) {
    return <p className="text-sm text-red-600">{loadError}</p>;
  }

  if (!profile) {
    return <p className="text-sm text-gray-400">Loading…</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-navy-900">Profile Information</h2>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar src={profile.photo ?? undefined} name={fullName} size={80} />
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
          {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-navy-900">Contact Details</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-navy-900">
                <Mail size={14} /> Primary Email Address
              </p>
              <div className="mt-1.5">
                <input
                  value={profile.email}
                  disabled
                  className="w-full rounded-lg border border-black/10 bg-gray-100 px-4 py-2.5 text-sm text-gray-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Contact an administrator to change your login email</p>
            </div>
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-navy-900">
                <Phone size={14} /> Mobile Phone Number
              </p>
              <div className="mt-1.5">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Used for 2FA and client notifications</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-navy-900">Security &amp; Privacy</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 12 characters"
                className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
              />
            </div>
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            {passwordMessage && <p className="text-sm text-emerald-600">{passwordMessage}</p>}
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handlePasswordUpdate}
              disabled={passwordSaving || !currentPassword || !newPassword}
            >
              {passwordSaving ? "Updating…" : "Update Password"}
            </Button>
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
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function load() {
    listPortalUsers()
      .then(setUsers)
      .catch(() => setLoadError("Couldn't load users. You may need Administrator access."));
  }

  useEffect(load, []);

  function runAction(userId: string, action: (id: string) => Promise<void>) {
    setPendingId(userId);
    startTransition(async () => {
      await action(userId);
      load();
      setPendingId(null);
    });
  }

  const pendingCount = users?.filter((u) => u.status === "PENDING").length ?? 0;

  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-navy-900">User Management</h2>
          <p className="text-sm text-gray-500">
            Approve new agent applications and manage platform accounts.
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge tone="gold">
            {pendingCount} Pending Approval{pendingCount === 1 ? "" : "s"}
          </Badge>
        )}
      </div>

      {loadError && <p className="px-6 py-6 text-sm text-red-600">{loadError}</p>}

      {!loadError && !users && (
        <p className="px-6 py-10 text-center text-sm text-gray-400">Loading users…</p>
      )}

      {users && users.length === 0 && (
        <p className="px-6 py-10 text-center text-sm text-gray-400">No users yet.</p>
      )}

      {users && users.length > 0 && (
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
              {users.map((user) => {
                const status = statusDisplay[user.status];
                const busy = isPending && pendingId === user.id;
                return (
                  <tr key={user.id} className="border-t border-black/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.photo ?? undefined} initials={getInitials(user.name)} size={36} />
                        <div>
                          <p className="font-semibold text-navy-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={adminRoleTone[user.role]}>{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-sm ${status.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3 text-gray-400">
                        {user.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              aria-label="Approve agent"
                              disabled={busy}
                              onClick={() => runAction(user.id, approveUserAction)}
                              className="text-emerald-600 hover:text-emerald-700 disabled:opacity-40"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              aria-label="Reject application"
                              disabled={busy}
                              onClick={() => runAction(user.id, rejectUserAction)}
                              className="text-red-500 hover:text-red-600 disabled:opacity-40"
                            >
                              <XIcon size={16} />
                            </button>
                          </>
                        )}
                        {user.status === "ACTIVE" && (
                          <button
                            type="button"
                            aria-label="Deactivate user"
                            disabled={busy}
                            onClick={() => runAction(user.id, deactivateUserAction)}
                            className="hover:text-red-600 disabled:opacity-40"
                          >
                            <UserX size={15} />
                          </button>
                        )}
                        {(user.status === "DEACTIVATED" || user.status === "REJECTED") && (
                          <button
                            type="button"
                            aria-label="Reactivate user"
                            disabled={busy}
                            onClick={() => runAction(user.id, reactivateUserAction)}
                            className="text-emerald-600 hover:text-emerald-700 disabled:opacity-40"
                          >
                            <UserCheck size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
  const [rules, setRules] = useState<CommissionRules | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getCommissionRules().then(setRules);
  }, []);

  function update<K extends keyof CommissionRules>(key: K, value: CommissionRules[K]) {
    setRules((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  async function save() {
    if (!rules) return;
    setSaving(true);
    setError("");
    const result = await updateCommissionRulesAction(rules);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

  if (!rules) {
    return <p className="py-10 text-center text-sm text-gray-400">Loading commission rules…</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-navy-900">Commission Structure</h2>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : saved ? "Saved" : "Save Rules"}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-navy-900">Brokerage Split</p>
              <p className="text-xs text-gray-500">Standard percentage retained by the brokerage per transaction.</p>
            </div>
            <p className="font-serif text-xl font-bold text-gold-600">{rules.brokerageSplitPercent}%</p>
          </div>
          <input
            type="range"
            value={rules.brokerageSplitPercent}
            onChange={(e) => update("brokerageSplitPercent", Number(e.target.value))}
            className="mt-3 w-full accent-gold-500"
          />
        </div>

        <div className="mt-6 border-t border-black/5 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-navy-900">Referral Fees</p>
              <p className="text-xs text-gray-500">Payout for external lead referrals.</p>
            </div>
            <p className="font-serif text-xl font-bold text-gold-600">{rules.referralFeePercent}%</p>
          </div>
          <input
            type="range"
            value={rules.referralFeePercent}
            onChange={(e) => update("referralFeePercent", Number(e.target.value))}
            className="mt-3 w-full accent-gold-500"
          />
        </div>

        <div className="mt-6 border-t border-black/5 pt-6">
          <p className="text-sm font-semibold text-navy-900">Tiered Incentives (High Volume)</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-offwhite p-4">
              <p className="text-[11px] uppercase text-gray-400">Sales Threshold (PHP)</p>
              <input
                type="number"
                min={0}
                value={rules.tierThreshold}
                onChange={(e) => update("tierThreshold", Number(e.target.value))}
                className="mt-1 w-full bg-transparent font-serif text-lg font-bold text-navy-900 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">Sales volume threshold for the bonus tier.</p>
            </div>
            <div className="rounded-lg bg-offwhite p-4">
              <p className="text-[11px] uppercase text-gray-400">Bonus Percentage</p>
              <input
                type="number"
                min={0}
                value={rules.tierBonusPercent}
                onChange={(e) => update("tierBonusPercent", Number(e.target.value))}
                className="mt-1 w-full bg-transparent font-serif text-lg font-bold text-navy-900 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">Additional bonus for top performers.</p>
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
                <input
                  type="number"
                  min={0}
                  value={rules.withholdingTaxPercent}
                  onChange={(e) => update("withholdingTaxPercent", Number(e.target.value))}
                  className="w-full bg-transparent text-sm text-white focus:outline-none"
                />
                <span className="text-sm text-white/60">%</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/60">Transaction Processing Fee</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2">
                <span className="text-sm text-white/60">₱</span>
                <input
                  type="number"
                  min={0}
                  value={rules.transactionFee}
                  onChange={(e) => update("transactionFee", Number(e.target.value))}
                  className="w-full bg-transparent text-sm text-white focus:outline-none"
                />
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
              <span className="font-semibold text-navy-900">
                {new Date(`${rules.effectiveDate}T00:00:00`).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Auto-Calculation</span>
              <button
                type="button"
                onClick={() => update("autoCalculationEnabled", !rules.autoCalculationEnabled)}
                className={`font-semibold ${rules.autoCalculationEnabled ? "text-gold-600" : "text-gray-400"}`}
              >
                {rules.autoCalculationEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceTab() {
  const [config, setConfig] = useState<AttendanceConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAttendanceConfig().then(setConfig);
  }, []);

  function update<K extends keyof AttendanceConfig>(key: K, value: AttendanceConfig[K]) {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  function updateTier(index: number, points: number) {
    setConfig((prev) => {
      if (!prev) return prev;
      const rewardTiers = prev.rewardTiers.map((t, i) => (i === index ? { ...t, points } : t));
      return { ...prev, rewardTiers };
    });
    setSaved(false);
  }

  async function save() {
    if (!config) return;
    setSaving(true);
    setError("");
    const result = await updateAttendanceConfigAction({
      pointsPerMeeting: config.pointsPerMeeting,
      pointsPerPks: config.pointsPerPks,
      eligibilityMinRate: config.eligibilityMinRate,
      rewardTiers: config.rewardTiers,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

  if (!config) {
    return <p className="py-10 text-center text-sm text-gray-400">Loading attendance rules…</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-navy-900">Attendance &amp; Reward Rules</h2>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : saved ? "Saved" : "Save Rules"}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <p className="mt-1 text-sm text-gray-500">
          Configure how meeting and PKS attendance is scored and rewarded. Changes apply to every
          agent&rsquo;s dashboard immediately.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-offwhite p-4">
            <p className="text-[11px] uppercase text-gray-400">Points per Meeting</p>
            <input
              type="number"
              min={0}
              value={config.pointsPerMeeting}
              onChange={(e) => update("pointsPerMeeting", Number(e.target.value))}
              className="mt-1 w-full bg-transparent font-serif text-lg font-bold text-navy-900 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Awarded for each attended meeting.</p>
          </div>
          <div className="rounded-lg bg-offwhite p-4">
            <p className="text-[11px] uppercase text-gray-400">Points per PKS Session</p>
            <input
              type="number"
              min={0}
              value={config.pointsPerPks}
              onChange={(e) => update("pointsPerPks", Number(e.target.value))}
              className="mt-1 w-full bg-transparent font-serif text-lg font-bold text-navy-900 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Awarded for each attended seminar.</p>
          </div>
        </div>

        <div className="mt-6 border-t border-black/5 pt-6">
          <p className="text-sm font-semibold text-navy-900">Reward Thresholds</p>
          <p className="text-xs text-gray-500">Point totals required to unlock each reward tier.</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {config.rewardTiers.map((tier, i) => (
              <div key={tier.label} className="rounded-lg bg-offwhite p-4">
                <p className="flex items-center gap-1.5 text-[11px] uppercase text-gray-400">
                  <Trophy size={12} className="text-gold-500" /> {tier.label}
                </p>
                <input
                  type="number"
                  min={0}
                  value={tier.points}
                  onChange={(e) => updateTier(i, Number(e.target.value))}
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
              {config.eligibilityMinRate}%
            </p>
          </div>
          <input
            type="range"
            value={config.eligibilityMinRate}
            onChange={(e) => update("eligibilityMinRate", Number(e.target.value))}
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
            Points and rates reset at the start of each period. Changing the active cycle isn&rsquo;t
            supported from this tab yet.
          </p>
          <select
            value={config.period}
            disabled
            className="mt-4 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none disabled:opacity-60"
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
              <span className="font-semibold text-navy-900">{config.periodLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Meeting / PKS Points</span>
              <span className="font-semibold text-navy-900">
                {config.pointsPerMeeting} / {config.pointsPerPks} pts
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Eligibility</span>
              <span className="font-semibold text-gold-600">
                &ge;{config.eligibilityMinRate}% attendance
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

function toPermissionEnumKey(key: string): PermissionKey {
  return key.replace(/-/g, "_").toUpperCase() as PermissionKey;
}

function PermissionsTab() {
  const [users, setUsers] = useState<UserPermissionRow[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ key: string; message: string } | null>(null);

  function load() {
    listUserPermissions()
      .then(setUsers)
      .catch(() => setLoadError("Couldn't load permissions. You may need Administrator access."));
  }

  useEffect(load, []);

  async function toggle(userId: string, permissionKey: string, next: boolean) {
    const cellKey = `${userId}:${permissionKey}`;
    setBusyKey(cellKey);
    setRowError(null);
    const result = await setUserPermissionAction(userId, toPermissionEnumKey(permissionKey), next);
    setBusyKey(null);
    if (result.error) {
      setRowError({ key: cellKey, message: result.error });
      return;
    }
    load();
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="border-b border-black/5 p-6">
        <h2 className="font-serif text-lg font-bold text-navy-900">User Permissions</h2>
        <p className="text-sm text-gray-500">
          What each active user can access across the portal. Toggle any permission on or off for
          an individual person — this overrides their role&rsquo;s default.
        </p>
      </div>

      {loadError && <p className="px-6 py-6 text-sm text-red-600">{loadError}</p>}

      {!loadError && !users && (
        <p className="px-6 py-10 text-center text-sm text-gray-400">Loading permissions…</p>
      )}

      {users && users.length === 0 && (
        <p className="px-6 py-10 text-center text-sm text-gray-400">No active users yet.</p>
      )}

      {users && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-400">
                <th className="sticky left-0 bg-white px-6 py-3 font-medium">User</th>
                {permissionDefs.map((def) => (
                  <th key={def.key} className="px-3 py-3 text-center font-medium">
                    <span title={def.description}>{def.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-black/5">
                  <td className="sticky left-0 bg-white px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.photo ?? undefined} initials={getInitials(user.name)} size={32} />
                      <div>
                        <p className="font-semibold text-navy-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  {permissionDefs.map((def) => {
                    const cellKey = `${user.id}:${def.key}`;
                    const granted = user.permissions[toPermissionEnumKey(def.key)] ?? false;
                    const locked = def.adminLocked && user.role === "ADMINISTRATOR";
                    return (
                      <td key={def.key} className="px-3 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <Toggle
                            checked={granted}
                            disabled={locked || busyKey === cellKey}
                            onChange={(v) => toggle(user.id, def.key, v)}
                            label={`${def.label} for ${user.name}`}
                          />
                          {rowError?.key === cellKey && (
                            <p className="max-w-24 text-center text-[10px] leading-tight text-red-600">
                              {rowError.message}
                            </p>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-black/5 p-4 text-xs text-gray-400">
        <Lock size={12} className="mr-1 inline" />
        &ldquo;Manage Permissions&rdquo; is always retained by Administrators and cannot be revoked.
      </div>
    </div>
  );
}

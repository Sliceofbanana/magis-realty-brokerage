"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/authz";
import { getSystemSettings, invalidateSystemSettings } from "@/lib/system-settings";
import {
  MESSAGE_MAX_LENGTH,
  maintenanceFeatures,
  sanitizeFeatures,
  type SystemSettingsValue,
} from "@/lib/maintenance";

export type SystemAdminRow = { id: string; name: string; email: string; isSystemAdmin: boolean };

export type SystemOverview = {
  settings: SystemSettingsValue;
  /** Active Administrators, flagged by whether they are also System Admins. */
  administrators: SystemAdminRow[];
  currentUserId: string;
};

export async function getSystemOverviewAction(): Promise<SystemOverview> {
  const me = await requireSystemAdmin();
  const [settings, admins] = await Promise.all([
    getSystemSettings({ fresh: true }),
    prisma.user.findMany({
      where: { role: "ADMINISTRATOR", status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, isSystemAdmin: true },
    }),
  ]);
  return { settings, administrators: admins, currentUserId: me.id };
}

export type SaveSystemResult = { error?: string; success?: boolean };

const trimMessage = (v: string) => v.trim().slice(0, MESSAGE_MAX_LENGTH);

/** Describes what changed, for the activity log. */
function describeChanges(before: SystemSettingsValue, after: SystemSettingsValue): string[] {
  const out: string[] = [];
  const onOff = (v: boolean) => (v ? "ON" : "OFF");
  if (before.publicMaintenance !== after.publicMaintenance) out.push(`Public website maintenance ${onOff(after.publicMaintenance)}`);
  if (before.portalMaintenance !== after.portalMaintenance) out.push(`Portal maintenance ${onOff(after.portalMaintenance)}`);
  for (const f of maintenanceFeatures) {
    const was = before.maintenanceFeatures.includes(f.key);
    const now = after.maintenanceFeatures.includes(f.key);
    if (was !== now) out.push(`${f.label} maintenance ${onOff(now)}`);
  }
  if (before.registrationOpen !== after.registrationOpen) out.push(`Sign-ups ${after.registrationOpen ? "opened" : "closed"}`);
  if (before.inquiriesOpen !== after.inquiriesOpen) out.push(`Public forms ${after.inquiriesOpen ? "opened" : "closed"}`);
  if (
    before.publicMessage !== after.publicMessage ||
    before.portalMessage !== after.portalMessage ||
    before.featureMessage !== after.featureMessage
  )
    out.push("Maintenance message updated");
  return out;
}

/** System Admin only: saves the platform switches. */
export async function saveSystemSettingsAction(input: SystemSettingsValue): Promise<SaveSystemResult> {
  let me;
  try {
    me = await requireSystemAdmin();
  } catch {
    return { error: "Only a System Admin can change these settings." };
  }

  const before = await getSystemSettings({ fresh: true });
  const next: SystemSettingsValue = {
    publicMaintenance: !!input.publicMaintenance,
    publicMessage: trimMessage(String(input.publicMessage ?? "")),
    portalMaintenance: !!input.portalMaintenance,
    portalMessage: trimMessage(String(input.portalMessage ?? "")),
    maintenanceFeatures: sanitizeFeatures(input.maintenanceFeatures),
    featureMessage: trimMessage(String(input.featureMessage ?? "")),
    registrationOpen: !!input.registrationOpen,
    inquiriesOpen: !!input.inquiriesOpen,
  };

  const data = {
    publicMaintenance: next.publicMaintenance,
    publicMessage: next.publicMessage || null,
    portalMaintenance: next.portalMaintenance,
    portalMessage: next.portalMessage || null,
    maintenanceFeatures: next.maintenanceFeatures,
    featureMessage: next.featureMessage || null,
    registrationOpen: next.registrationOpen,
    inquiriesOpen: next.inquiriesOpen,
    updatedById: me.id,
  };
  await prisma.systemSettings.upsert({ where: { id: "singleton" }, update: data, create: { id: "singleton", ...data } });
  invalidateSystemSettings();

  const changes = describeChanges(before, next);
  if (changes.length) {
    await prisma.activityLogEntry.create({
      data: { userId: me.id, userLabel: me.name || me.email, action: changes.join("; ").slice(0, 400), module: "System" },
    });
  }

  revalidatePath("/portal/system");
  return { success: true };
}

/** System Admin only: grants or removes the System Admin tag on an active Administrator. */
export async function setSystemAdminAction(userId: string, makeSystemAdmin: boolean): Promise<SaveSystemResult> {
  let me;
  try {
    me = await requireSystemAdmin();
  } catch {
    return { error: "Only a System Admin can do this." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, status: true, isSystemAdmin: true },
  });
  if (!target || target.role !== "ADMINISTRATOR" || target.status !== "ACTIVE") {
    return { error: "Only active Administrators can be made System Admins." };
  }
  if (target.isSystemAdmin === makeSystemAdmin) return { success: true };

  if (!makeSystemAdmin) {
    const others = await prisma.user.count({ where: { isSystemAdmin: true, status: "ACTIVE", NOT: { id: userId } } });
    if (others === 0) return { error: "There must always be at least one System Admin." };
  }

  await prisma.user.update({ where: { id: userId }, data: { isSystemAdmin: makeSystemAdmin } });
  await prisma.activityLogEntry.create({
    data: {
      userId: me.id,
      userLabel: me.name || me.email,
      action: `${makeSystemAdmin ? "Made" : "Removed"} ${target.name} ${makeSystemAdmin ? "a" : "as"} System Admin`,
      module: "System",
    },
  });
  revalidatePath("/portal/system");
  return { success: true };
}

import { ActivityLogEntry, PortalUser } from "@/lib/types";

export const portalUsers: PortalUser[] = [
  { id: "1", name: "Julianna De-Marko", email: "julianna@magisrealty.com", initials: "JD", role: "Administrator", status: "Active" },
  { id: "2", name: "Sterling Archer", email: "sterling.a@magisrealty.com", initials: "SA", role: "Broker", status: "Active" },
  { id: "3", name: "Sarah Miller", email: "sarah.m@magisrealty.com", initials: "SM", role: "Agent", status: "Deactive" },
  { id: "4", name: "Lana Watson", email: "lana@magisrealty.com", initials: "LW", role: "Marketing", status: "Active" },
];

export const activityLog: ActivityLogEntry[] = [
  { id: "1", user: "Sarah Vance", email: "sarah@magisrealty.com", initials: "SV", action: "Created Listing", module: "Residential Sales", timestamp: "Oct 19, 2023 · 09:42 AM", ip: "192.168.1.45" },
  { id: "2", user: "John Doe", email: "j.doe@magisrealty.com", initials: "JD", action: "Exported Leads", module: "CRM Database", timestamp: "Oct 19, 2023 · 08:15 AM", ip: "45.22.129.11" },
  { id: "3", user: "System Auto", email: "automated@magisrealty.com", initials: "SYS", action: "Back Up Completed", module: "Infrastructure", timestamp: "Oct 19, 2023 · 02:00 AM", ip: "localhost" },
  { id: "4", user: "Michael Aris", email: "aris.m@magisrealty.com", initials: "MA", action: "Failed Login", module: "User Auth", timestamp: "Oct 18, 2023 · 11:58 PM", ip: "104.28.19.2" },
];

/**
 * Seeds the database from the front-end's existing lib/data/*.ts fixtures.
 * Idempotent — safe to re-run (everything upserts on a stable unique key).
 *
 * The front-end's mock data grew organically across several independent
 * arrays (agents.ts, users.ts, team.ts, leaderboard.ts) that describe the
 * same people from different angles — e.g. "Marcus Thorne" is a public
 * Agent, a birthday TeamMember, and a LeaderboardAgent all at once, tied
 * together only by matching name and photo. This script reconciles that
 * by hand into one canonical `people` list below, rather than attempting
 * fragile fuzzy name-matching in code.
 */
import "dotenv/config";
import { Prisma, PortalRole, UserStatus, PropertyStatus, PropertyType, LeadStatus, LeadPriority, QuotaPeriodId, AttendancePeriod, AttendanceType, AttendanceStatus, BadgeType, PermissionKey } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";

/** Shared demo password for every seeded account (dev/demo only). */
const DEMO_PASSWORD = "Password123!";

import { properties } from "../lib/data/properties";
import { agents, testimonials } from "../lib/data/agents";
import { blogPosts } from "../lib/data/blog";
import { faqCategories } from "../lib/data/faqs";
import { leads } from "../lib/data/leads";
import { documents } from "../lib/data/documents";
import { activityLog } from "../lib/data/users";
import { commissionRecords } from "../lib/data/commissionReleases";
import { attendanceConfig, attendanceSessions } from "../lib/data/attendance";
import { leaderboardTeams, quotaPeriods, leaderboardAgents } from "../lib/data/leaderboard";
import { defaultBirthdayConfig } from "../lib/data/team";
import { defaultRolePermissions } from "../lib/data/permissions";

// ── Canonical people ────────────────────────────────────────────────────
// One row per real person, hand-merged from every mock source that
// mentions them. `agentProfile` is set only for people who need a public
// bio (from agents.ts) and/or a leaderboard presence (region/team/quota).

type SeedPerson = {
  email: string;
  name: string;
  role: PortalRole;
  status: UserStatus;
  photo?: string;
  phone?: string;
  position?: string;
  birthDate?: string; // YYYY-MM-DD
  isYou?: boolean;
  /// lib/data/leaderboard.ts's LeaderboardAgent.id, when this person has a
  /// leaderboard row — names differ between sources ("Alexander Sterling"
  /// vs. "Alex Sterling"), so join on this instead of on `name`.
  leaderboardId?: string;
  agentProfile?: {
    slug: string;
    quote?: string;
    bio?: string[];
    specialties?: { title: string; description: string }[];
    rating?: number;
    reviewCount?: number;
    specialization?: string;
    topPerformer?: boolean;
    publicVerified?: boolean;
    activeListings?: number;
    region?: string;
    teamId?: string;
    yearsExperience?: number;
    propertiesSoldValue?: string;
    clientSatisfaction?: string;
  };
};

function findAgent(slug: string) {
  const agent = agents.find((a) => a.slug === slug);
  if (!agent) throw new Error(`Seed data drift: agent "${slug}" not found in lib/data/agents.ts`);
  return agent;
}

const clara = findAgent("clara-beaumont");
const alexander = findAgent("alexander-sterling");
const marcus = findAgent("marcus-thorne");
const elena = findAgent("elena-rodriguez");

const leaderboardById = new Map(leaderboardAgents.map((a) => [a.id, a]));

const people: SeedPerson[] = [
  // ── Portal-only accounts (lib/data/users.ts, no public agent page) ──
  {
    email: "julianna@magisrealty.com",
    name: "Julianna De-Marko",
    role: PortalRole.ADMINISTRATOR,
    status: UserStatus.ACTIVE,
    photo: undefined,
    position: "Administrator",
    birthDate: "1983-09-05",
  },
  {
    email: "sterling.a@magisrealty.com",
    name: "Sterling Archer",
    role: PortalRole.BROKER,
    status: UserStatus.ACTIVE,
  },
  {
    email: "sarah.m@magisrealty.com",
    name: "Sarah Miller",
    role: PortalRole.AGENT,
    status: UserStatus.DEACTIVATED,
  },
  {
    email: "lana@magisrealty.com",
    name: "Lana Watson",
    role: PortalRole.MARKETING,
    status: UserStatus.ACTIVE,
  },

  // ── Public agents (lib/data/agents.ts), merged with team.ts + leaderboard.ts ──
  {
    email: clara.email,
    name: clara.name,
    role: PortalRole.AGENT,
    status: UserStatus.ACTIVE,
    photo: clara.photo,
    phone: clara.phone,
    position: clara.title,
    agentProfile: {
      slug: clara.slug,
      quote: clara.quote,
      bio: clara.bio,
      specialties: clara.specialties,
      rating: clara.rating,
      reviewCount: clara.reviews,
      specialization: clara.specialization,
      topPerformer: clara.topPerformer,
      publicVerified: clara.verified,
      activeListings: clara.activeListings,
      yearsExperience: clara.yearsExperience,
      propertiesSoldValue: clara.propertiesSoldValue,
      clientSatisfaction: clara.clientSatisfaction,
    },
  },
  {
    email: alexander.email,
    name: alexander.name,
    role: PortalRole.AGENT,
    status: UserStatus.ACTIVE,
    photo: alexander.photo,
    phone: alexander.phone,
    position: alexander.title,
    isYou: true, // leaderboard.ts marks "Alex Sterling" isYou:true
    leaderboardId: "alex-sterling",
    agentProfile: {
      slug: alexander.slug,
      quote: alexander.quote,
      bio: alexander.bio,
      specialties: alexander.specialties,
      rating: alexander.rating,
      reviewCount: alexander.reviews,
      specialization: alexander.specialization,
      topPerformer: alexander.topPerformer,
      publicVerified: alexander.verified,
      activeListings: alexander.activeListings,
      yearsExperience: alexander.yearsExperience,
      propertiesSoldValue: alexander.propertiesSoldValue,
      clientSatisfaction: alexander.clientSatisfaction,
      region: leaderboardById.get("alex-sterling")?.region,
      teamId: leaderboardById.get("alex-sterling")?.teamId,
    },
  },
  {
    email: marcus.email,
    name: marcus.name,
    role: PortalRole.AGENT,
    status: UserStatus.ACTIVE,
    photo: marcus.photo,
    phone: marcus.phone,
    position: marcus.title,
    birthDate: "1985-03-14",
    leaderboardId: "marcus-thorne",
    agentProfile: {
      slug: marcus.slug,
      quote: marcus.quote,
      bio: marcus.bio,
      specialties: marcus.specialties,
      rating: marcus.rating,
      reviewCount: marcus.reviews,
      specialization: marcus.specialization,
      topPerformer: marcus.topPerformer,
      publicVerified: marcus.verified,
      activeListings: marcus.activeListings,
      yearsExperience: marcus.yearsExperience,
      propertiesSoldValue: marcus.propertiesSoldValue,
      clientSatisfaction: marcus.clientSatisfaction,
      region: leaderboardById.get("marcus-thorne")?.region,
      teamId: leaderboardById.get("marcus-thorne")?.teamId,
    },
  },
  {
    email: elena.email,
    name: elena.name,
    role: PortalRole.AGENT,
    status: UserStatus.ACTIVE,
    photo: elena.photo,
    phone: elena.phone,
    position: elena.title,
    birthDate: "1992-11-02",
    leaderboardId: "elena-rodriguez",
    agentProfile: {
      slug: elena.slug,
      quote: elena.quote,
      bio: elena.bio,
      specialties: elena.specialties,
      rating: elena.rating,
      reviewCount: elena.reviews,
      specialization: elena.specialization,
      topPerformer: elena.topPerformer,
      publicVerified: elena.verified,
      activeListings: elena.activeListings,
      yearsExperience: elena.yearsExperience,
      propertiesSoldValue: elena.propertiesSoldValue,
      clientSatisfaction: elena.clientSatisfaction,
      region: leaderboardById.get("elena-rodriguez")?.region,
      teamId: leaderboardById.get("elena-rodriguez")?.teamId,
    },
  },

  // ── Team-only / leaderboard-only people (no public bio) ──
  {
    email: "agent.smith@magisrealty.com",
    name: "Agent Smith",
    role: PortalRole.AGENT,
    status: UserStatus.ACTIVE,
    position: "Senior Portfolio Manager",
    birthDate: "1990-07-30",
    isYou: true, // team.ts / Topbar demo persona — owns the seeded commissions & attendance
  },
  {
    email: "sarah.jenkins@magisrealty.com",
    name: "Sarah Jenkins",
    role: PortalRole.BROKER,
    status: UserStatus.ACTIVE,
    position: "Residential Broker",
    birthDate: "1988-07-30",
    photo: leaderboardById.get("sarah-jenkins")?.photo,
    leaderboardId: "sarah-jenkins",
    agentProfile: {
      slug: "sarah-jenkins",
      region: leaderboardById.get("sarah-jenkins")?.region,
      teamId: leaderboardById.get("sarah-jenkins")?.teamId,
    },
  },
  {
    email: "david.chen@magisrealty.com",
    name: "David Chen",
    role: PortalRole.MARKETING,
    status: UserStatus.ACTIVE,
    position: "Marketing Lead",
    birthDate: "1987-01-19",
    photo: leaderboardById.get("david-chen")?.photo,
    leaderboardId: "david-chen",
    agentProfile: {
      slug: "david-chen",
      region: leaderboardById.get("david-chen")?.region,
      teamId: leaderboardById.get("david-chen")?.teamId,
    },
  },
  {
    email: "julian.vancore@magisrealty.com",
    name: "Julian Vancore",
    role: PortalRole.AGENT,
    status: UserStatus.ACTIVE,
    photo: leaderboardById.get("julian-vancore")?.photo,
    leaderboardId: "julian-vancore",
    agentProfile: {
      slug: "julian-vancore",
      region: leaderboardById.get("julian-vancore")?.region,
      teamId: leaderboardById.get("julian-vancore")?.teamId,
    },
  },
  {
    email: "isabella.ross@magisrealty.com",
    name: "Isabella Ross",
    role: PortalRole.AGENT,
    status: UserStatus.ACTIVE,
    photo: leaderboardById.get("isabella-ross")?.photo,
    leaderboardId: "isabella-ross",
    agentProfile: {
      slug: "isabella-ross",
      region: leaderboardById.get("isabella-ross")?.region,
      teamId: leaderboardById.get("isabella-ross")?.teamId,
    },
  },
  {
    email: "thomas.wright@magisrealty.com",
    name: "Thomas Wright",
    role: PortalRole.AGENT,
    status: UserStatus.ACTIVE,
    photo: leaderboardById.get("thomas-wright")?.photo,
    leaderboardId: "thomas-wright",
    agentProfile: {
      slug: "thomas-wright",
      region: leaderboardById.get("thomas-wright")?.region,
      teamId: leaderboardById.get("thomas-wright")?.teamId,
    },
  },

  // ── Demonstrates the Odoo-style PENDING approval gate ──
  {
    email: "ramon.delacruz@magisrealty.com",
    name: "Ramon Dela Cruz",
    role: PortalRole.AGENT,
    status: UserStatus.PENDING,
    position: "Agent Applicant",
  },
];

async function seedUsers() {
  const idByEmail = new Map<string, string>();
  // Computed once — every seeded account shares the same demo password.
  const demoPasswordHash = await hashPassword(DEMO_PASSWORD);

  for (const person of people) {
    const user = await prisma.user.upsert({
      where: { email: person.email },
      update: {
        name: person.name,
        role: person.role,
        status: person.status,
        photo: person.photo,
        phone: person.phone,
        position: person.position,
        birthDate: person.birthDate ? new Date(person.birthDate) : undefined,
        isYou: person.isYou ?? false,
        passwordHash: demoPasswordHash,
      },
      create: {
        email: person.email,
        name: person.name,
        role: person.role,
        status: person.status,
        photo: person.photo,
        phone: person.phone,
        position: person.position,
        birthDate: person.birthDate ? new Date(person.birthDate) : undefined,
        isYou: person.isYou ?? false,
        passwordHash: demoPasswordHash,
      },
    });
    idByEmail.set(person.email, user.id);

    if (person.agentProfile) {
      await prisma.agentProfile.upsert({
        where: { userId: user.id },
        update: {
          slug: person.agentProfile.slug,
          quote: person.agentProfile.quote,
          bio: person.agentProfile.bio ?? [],
          specialties: person.agentProfile.specialties as unknown as Prisma.InputJsonValue,
          rating: person.agentProfile.rating ?? 0,
          reviewCount: person.agentProfile.reviewCount ?? 0,
          specialization: person.agentProfile.specialization,
          topPerformer: person.agentProfile.topPerformer ?? false,
          publicVerified: person.agentProfile.publicVerified ?? false,
          activeListings: person.agentProfile.activeListings ?? 0,
          yearsExperience: person.agentProfile.yearsExperience,
          propertiesSoldValue: person.agentProfile.propertiesSoldValue,
          clientSatisfaction: person.agentProfile.clientSatisfaction,
          region: person.agentProfile.region,
          teamId: person.agentProfile.teamId,
        },
        create: {
          userId: user.id,
          slug: person.agentProfile.slug,
          quote: person.agentProfile.quote,
          bio: person.agentProfile.bio ?? [],
          specialties: person.agentProfile.specialties as unknown as Prisma.InputJsonValue,
          rating: person.agentProfile.rating ?? 0,
          reviewCount: person.agentProfile.reviewCount ?? 0,
          specialization: person.agentProfile.specialization,
          topPerformer: person.agentProfile.topPerformer ?? false,
          publicVerified: person.agentProfile.publicVerified ?? false,
          activeListings: person.agentProfile.activeListings ?? 0,
          yearsExperience: person.agentProfile.yearsExperience,
          propertiesSoldValue: person.agentProfile.propertiesSoldValue,
          clientSatisfaction: person.agentProfile.clientSatisfaction,
          region: person.agentProfile.region,
          teamId: person.agentProfile.teamId,
        },
      });
    }
  }

  return idByEmail;
}

async function seedRolePermissions() {
  for (const [role, keys] of Object.entries(defaultRolePermissions)) {
    for (const key of keys) {
      await prisma.rolePermission.upsert({
        where: {
          role_permission: {
            role: role.toUpperCase() as PortalRole,
            permission: toPermissionEnum(key),
          },
        },
        update: { granted: true },
        create: {
          role: role.toUpperCase() as PortalRole,
          permission: toPermissionEnum(key),
          granted: true,
        },
      });
    }
  }
}

function toPermissionEnum(key: string): PermissionKey {
  return key.replace(/-/g, "_").toUpperCase() as PermissionKey;
}

async function seedProperties(idByEmail: Map<string, string>) {
  const idBySlug = new Map<string, string>();
  const emailByAgentSlug = new Map(agents.map((a) => [a.slug, a.email]));

  for (const p of properties) {
    const agentEmail = emailByAgentSlug.get(p.agentId);
    const agentId = agentEmail ? idByEmail.get(agentEmail) : undefined;
    if (!agentId) throw new Error(`Seed data drift: no seeded user for agent slug "${p.agentId}"`);

    const record = await prisma.property.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        collection: p.collection,
        status: toPropertyStatus(p.status),
        type: p.type.toUpperCase() as PropertyType,
        location: p.location,
        address: p.address,
        price: p.price,
        pricePerSqft: p.pricePerSqft,
        beds: p.beds,
        baths: p.baths,
        area: p.area,
        parking: p.parking,
        verified: p.verified,
        description: p.description,
        amenities: p.amenities,
        agentId,
      },
      create: {
        slug: p.slug,
        title: p.title,
        collection: p.collection,
        status: toPropertyStatus(p.status),
        type: p.type.toUpperCase() as PropertyType,
        location: p.location,
        address: p.address,
        price: p.price,
        pricePerSqft: p.pricePerSqft,
        beds: p.beds,
        baths: p.baths,
        area: p.area,
        parking: p.parking,
        verified: p.verified,
        description: p.description,
        amenities: p.amenities,
        agentId,
      },
    });
    idBySlug.set(p.slug, record.id);

    await prisma.propertyImage.deleteMany({ where: { propertyId: record.id } });
    const images = [p.image, ...p.gallery];
    await prisma.propertyImage.createMany({
      data: images.map((url, i) => ({
        propertyId: record.id,
        url,
        isCover: i === 0,
        sortOrder: i,
      })),
    });
  }

  return idBySlug;
}

function toPropertyStatus(status: string): PropertyStatus {
  return status.replace(/\s+/g, "_").toUpperCase() as PropertyStatus;
}

async function seedLeads(propertyIdBySlug: Map<string, string>) {
  // No natural unique key in the mock data — wipe and recreate each run.
  await prisma.lead.deleteMany();

  // Best-effort match against seeded property titles; free-text otherwise.
  const propertyIdByTitle = new Map(
    properties.map((p) => [p.title.toLowerCase(), propertyIdBySlug.get(p.slug)])
  );

  for (const l of leads) {
    const matchId = propertyIdByTitle.get(l.property.toLowerCase());
    await prisma.lead.create({
      data: {
        name: l.name,
        email: l.email,
        phone: l.phone,
        type: l.type,
        status: l.status.replace(/-/g, "_").toUpperCase() as LeadStatus,
        priority: l.priority.toUpperCase() as LeadPriority,
        propertyId: matchId,
        propertyLabel: matchId ? undefined : l.property,
      },
    });
  }
}

async function seedBlogAndContent() {
  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        content: post.content,
        pullQuote: post.pullQuote,
        tags: post.tags,
        image: post.image,
        readTime: post.readTime,
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        content: post.content,
        pullQuote: post.pullQuote,
        tags: post.tags,
        image: post.image,
        readTime: post.readTime,
      },
    });
  }

  for (const cat of faqCategories) {
    const category = await prisma.faqCategory.upsert({
      where: { slug: cat.id },
      update: { label: cat.label, icon: cat.icon },
      create: { slug: cat.id, label: cat.label, icon: cat.icon },
    });
    await prisma.faqItem.deleteMany({ where: { categoryId: category.id } });
    await prisma.faqItem.createMany({
      data: cat.items.map((item, i) => ({
        categoryId: category.id,
        question: item.question,
        answer: item.answer,
        sortOrder: i,
      })),
    });
  }

  await prisma.documentFile.deleteMany();
  await prisma.documentFile.createMany({
    data: documents.map((d) => ({
      name: d.name,
      category: d.category,
      type: d.type,
      size: d.size,
    })),
  });

  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({ data: testimonials });
}

async function seedCommissions(idByEmail: Map<string, string>, propertyIdBySlug: Map<string, string>) {
  const agentSmithId = idByEmail.get("agent.smith@magisrealty.com")!;
  // No natural unique key in the mock data — wipe and recreate each run.
  // CommissionRelease cascades on delete, so clearing records is enough.
  await prisma.commissionRecord.deleteMany({ where: { agentId: agentSmithId } });

  const propertyIdByTitle = new Map(
    properties.map((p) => [p.title.toLowerCase(), propertyIdBySlug.get(p.slug)])
  );

  for (const record of commissionRecords) {
    const created = await prisma.commissionRecord.create({
      data: {
        agentId: agentSmithId,
        propertyId: propertyIdByTitle.get(record.property.toLowerCase()),
        propertyLabel: record.property,
        closedDate: new Date(record.closedDate),
        earned: record.earned,
      },
    });
    if (record.releases.length) {
      await prisma.commissionRelease.createMany({
        data: record.releases.map((r) => ({
          recordId: created.id,
          date: new Date(r.date),
          amount: r.amount,
          note: r.note,
        })),
      });
    }
  }
}

async function seedAttendance(idByEmail: Map<string, string>) {
  const agentSmithId = idByEmail.get("agent.smith@magisrealty.com")!;
  // No natural unique key in the mock data — wipe and recreate each run.
  // AttendanceRecord cascades on delete, so clearing meetings is enough.
  await prisma.meeting.deleteMany();

  await prisma.attendanceConfig.upsert({
    where: { id: "singleton" },
    update: {
      period: attendanceConfig.period.toUpperCase() as AttendancePeriod,
      periodLabel: attendanceConfig.periodLabel,
      periodStart: new Date(attendanceConfig.periodStart),
      asOf: new Date(attendanceConfig.asOf),
      pointsPerMeeting: attendanceConfig.pointsPerMeeting,
      pointsPerPks: attendanceConfig.pointsPerPks,
      eligibilityMinRate: attendanceConfig.eligibilityMinRate,
    },
    create: {
      id: "singleton",
      period: attendanceConfig.period.toUpperCase() as AttendancePeriod,
      periodLabel: attendanceConfig.periodLabel,
      periodStart: new Date(attendanceConfig.periodStart),
      asOf: new Date(attendanceConfig.asOf),
      pointsPerMeeting: attendanceConfig.pointsPerMeeting,
      pointsPerPks: attendanceConfig.pointsPerPks,
      eligibilityMinRate: attendanceConfig.eligibilityMinRate,
    },
  });

  await prisma.rewardTier.deleteMany({ where: { configId: "singleton" } });
  await prisma.rewardTier.createMany({
    data: attendanceConfig.rewardTiers.map((t) => ({
      configId: "singleton",
      points: t.points,
      label: t.label,
    })),
  });

  for (const session of attendanceSessions) {
    const meeting = await prisma.meeting.create({
      data: {
        type: session.type.toUpperCase() as AttendanceType,
        title: session.title,
        date: new Date(session.date),
      },
    });
    await prisma.attendanceRecord.create({
      data: {
        meetingId: meeting.id,
        agentId: agentSmithId,
        status: session.status.toUpperCase() as AttendanceStatus,
      },
    });
  }
}

async function seedBirthdayConfig() {
  await prisma.birthdayConfig.upsert({
    where: { id: "singleton" },
    update: {
      enabled: defaultBirthdayConfig.enabled,
      messageTemplate: defaultBirthdayConfig.messageTemplate,
      confettiEnabled: defaultBirthdayConfig.confettiEnabled,
      greetingsEnabled: defaultBirthdayConfig.greetingsEnabled,
      rewardsEnabled: defaultBirthdayConfig.rewardsEnabled,
      rewardMessage: defaultBirthdayConfig.rewardMessage,
      notifyRoles: defaultBirthdayConfig.notifyRoles.map(
        (r) => r.toUpperCase() as PortalRole
      ),
    },
    create: {
      id: "singleton",
      enabled: defaultBirthdayConfig.enabled,
      messageTemplate: defaultBirthdayConfig.messageTemplate,
      confettiEnabled: defaultBirthdayConfig.confettiEnabled,
      greetingsEnabled: defaultBirthdayConfig.greetingsEnabled,
      rewardsEnabled: defaultBirthdayConfig.rewardsEnabled,
      rewardMessage: defaultBirthdayConfig.rewardMessage,
      notifyRoles: defaultBirthdayConfig.notifyRoles.map(
        (r) => r.toUpperCase() as PortalRole
      ),
    },
  });
}

// Seeded before seedUsers(): AgentProfile.teamId has a foreign key to
// LeaderboardTeam, so the teams must exist first.
async function seedLeaderboardTeams() {
  for (const team of leaderboardTeams) {
    await prisma.leaderboardTeam.upsert({
      where: { id: team.id },
      update: { name: team.name, tone: team.tone, dot: team.dot, border: team.border },
      create: { id: team.id, name: team.name, tone: team.tone, dot: team.dot, border: team.border },
    });
  }
}

async function seedLeaderboard(idByEmail: Map<string, string>) {
  // No natural unique key for QuotaPeriod in the mock data — wipe and
  // recreate each run. AgentQuota references it without cascade, so it
  // has to go first.
  await prisma.agentQuota.deleteMany();
  await prisma.quotaPeriod.deleteMany();

  const periodRowIds = new Map<QuotaPeriodId, string>();
  for (const period of quotaPeriods) {
    const periodId = period.id.toUpperCase() as QuotaPeriodId;
    const row = await prisma.quotaPeriod.create({
      data: {
        periodId,
        label: period.label,
        cycleLabel: period.cycleLabel,
        start: new Date(period.start),
        end: new Date(period.end),
        asOf: new Date(period.asOf),
        isActive: true,
      },
    });
    periodRowIds.set(periodId, row.id);
  }

  const emailByLeaderboardId = new Map(
    people.filter((p) => p.leaderboardId).map((p) => [p.leaderboardId!, p.email] as const)
  );

  for (const agent of leaderboardAgents) {
    const email = emailByLeaderboardId.get(agent.id);
    const agentUserId = email ? idByEmail.get(email) : undefined;
    if (!agentUserId) continue;

    for (const [periodKey, amount] of Object.entries(agent.quota)) {
      const quotaPeriodId = periodRowIds.get(periodKey.toUpperCase() as QuotaPeriodId);
      if (!quotaPeriodId) continue;
      await prisma.agentQuota.upsert({
        where: { agentId_quotaPeriodId: { agentId: agentUserId, quotaPeriodId } },
        update: { quotaAmount: amount },
        create: { agentId: agentUserId, quotaPeriodId, quotaAmount: amount },
      });
    }
  }
}

async function seedBadges(idByEmail: Map<string, string>) {
  const definitions: { type: BadgeType; label: string; description: string; icon: string }[] = [
    { type: "SALES_OF_THE_MONTH", label: "Sales of the Month", description: "Highest closed sales volume in the calendar month.", icon: "trophy" },
    { type: "ELITE_SELLER", label: "Elite Seller", description: "Sustained top-tier performance across multiple quarters.", icon: "gem" },
    { type: "VOLUME_LEADER", label: "Volume Leader", description: "Highest total transaction volume on the team.", icon: "trending-up" },
    { type: "FIRST_SALE", label: "First Sale", description: "Closed their first deal with Magis Realty.", icon: "sparkles" },
    { type: "THREE_MONTH_STREAK", label: "3-Month Streak", description: "Hit quota three months in a row.", icon: "flame" },
  ];

  const badgeIds = new Map<BadgeType, string>();
  for (const def of definitions) {
    const badge = await prisma.badge.upsert({
      where: { type: def.type },
      update: { label: def.label, description: def.description, icon: def.icon },
      create: def,
    });
    badgeIds.set(def.type, badge.id);
  }

  // A couple of illustrative awards so the feature isn't empty on first
  // load. No natural unique key — wipe and recreate each run.
  await prisma.agentBadge.deleteMany();
  const julianVancoreId = idByEmail.get("julian.vancore@magisrealty.com");
  const agentSmithId = idByEmail.get("agent.smith@magisrealty.com");
  if (julianVancoreId) {
    await prisma.agentBadge.create({
      data: { agentId: julianVancoreId, badgeId: badgeIds.get("SALES_OF_THE_MONTH")!, note: "Q4 2023 leaderboard #1" },
    });
  }
  if (agentSmithId) {
    await prisma.agentBadge.create({
      data: { agentId: agentSmithId, badgeId: badgeIds.get("FIRST_SALE")! },
    });
  }
}

async function seedActivityLog(idByEmail: Map<string, string>) {
  // No natural unique key in the mock data — wipe and recreate each run.
  await prisma.activityLogEntry.deleteMany();

  const emailByName = new Map(people.map((p) => [p.name, p.email]));

  for (const entry of activityLog) {
    const userId = emailByName.has(entry.user) ? idByEmail.get(emailByName.get(entry.user)!) : undefined;
    await prisma.activityLogEntry.create({
      data: {
        userId,
        userLabel: entry.user,
        action: entry.action,
        module: entry.module,
        ip: entry.ip,
      },
    });
  }
}

async function main() {
  console.log("Seeding leaderboard teams…");
  await seedLeaderboardTeams();

  console.log("Seeding users, RBAC, and agent profiles…");
  const idByEmail = await seedUsers();
  await seedRolePermissions();

  console.log("Seeding properties…");
  const propertyIdBySlug = await seedProperties(idByEmail);

  console.log("Seeding leads…");
  await seedLeads(propertyIdBySlug);

  console.log("Seeding blog, FAQs, documents, testimonials…");
  await seedBlogAndContent();

  console.log("Seeding commission records…");
  await seedCommissions(idByEmail, propertyIdBySlug);

  console.log("Seeding attendance…");
  await seedAttendance(idByEmail);

  console.log("Seeding birthday config…");
  await seedBirthdayConfig();

  console.log("Seeding quota periods and agent quotas…");
  await seedLeaderboard(idByEmail);

  console.log("Seeding badges…");
  await seedBadges(idByEmail);

  console.log("Seeding activity log…");
  await seedActivityLog(idByEmail);

  console.log("Seed complete.");
  console.log(`\nEvery seeded account's password: ${DEMO_PASSWORD}`);
  console.log("Try agent.smith@magisrealty.com (active) or ramon.delacruz@magisrealty.com (pending — blocked until an admin approves them).");

  // Reminder printed at the end of every seed run: quota "achieved" values
  // are intentionally not stored — compute them from CommissionRecord.
  console.log(
    "\nNote: AgentQuota only stores targets. Compute \"achieved\" per agent " +
      "by summing CommissionRecord.earned within each QuotaPeriod's date range."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

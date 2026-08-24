export type Property = {
  id: string;
  slug: string;
  title: string;
  collection: string;
  status: "For Sale" | "Sold" | "Pending" | "Exclusive";
  type: "Residential" | "Commercial";
  location: string;
  address: string;
  price: number;
  pricePerSqft: number;
  beds: number;
  baths: number;
  area: number;
  parking: number;
  verified: boolean;
  archived: boolean;
  image: string;
  gallery: string[];
  description: string[];
  amenities: string[];
  agentId: string;
};

export type Agent = {
  id: string;
  slug: string;
  name: string;
  title: string;
  quote: string;
  photo: string;
  email: string;
  phone: string;
  yearsExperience: number;
  propertiesSoldValue: string;
  clientSatisfaction: string;
  bio: string[];
  specialties: { title: string; description: string }[];
  rating: number;
  reviews: number;
  specialization: string;
  activeListings: number;
  topPerformer: boolean;
  verified: boolean;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  content: string[];
  pullQuote: string;
  tags: string[];
};

export type FaqItem = { question: string; answer: string };
export type FaqCategory = {
  id: string;
  label: string;
  icon: string;
  items: FaqItem[];
};

export type Lead = {
  id: string;
  name: string;
  initials: string;
  type: string;
  email: string;
  phone: string;
  property: string;
  price: string;
  date: string;
  status: "New" | "Qualified" | "Follow-up" | "Contacted";
  priority: "High" | "Medium" | "Low";
};

export type Transaction = {
  id: string;
  property: string;
  location: string;
  image: string;
  closedDate: string;
  salePrice: number;
  commissionPercent: number;
  commissionAmount: number;
  status: "Paid" | "Pending" | "In Review";
};

export type DocumentFile = {
  id: string;
  name: string;
  category: string;
  type: string;
  size: string;
  date: string;
};

export type TeamMember = {
  id: string;
  name: string;
  position: string;
  photo: string;
  birthDate: string; // YYYY-MM-DD — year used only for optional age display
  role: PortalRole;
  isYou?: boolean;
};

export type ReactionEmoji = "🎉" | "🎂" | "❤️" | "👏";

export type BirthdayGreeting = {
  id: string;
  celebrantId: string;
  authorName: string;
  authorPhoto: string;
  message: string;
  timestamp: string;
  reactions: Partial<Record<ReactionEmoji, number>>;
};

export type BirthdayConfig = {
  enabled: boolean;
  messageTemplate: string; // {{name}} placeholder
  confettiEnabled: boolean;
  greetingsEnabled: boolean;
  rewardsEnabled: boolean;
  rewardMessage: string;
  notifyRoles: PortalRole[];
};

export type CommissionRelease = {
  id: string;
  date: string;
  amount: number;
  note?: string;
};

export type CommissionRecord = {
  id: string;
  property: string;
  closedDate: string;
  earned: number;
  releases: CommissionRelease[];
};

export type PortalRole = "Administrator" | "Broker" | "Agent" | "Marketing";

export type PortalUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: PortalRole;
  status: "Active" | "Deactive";
};

export type PermissionKey =
  | "manage-users"
  | "manage-permissions"
  | "view-activity-log"
  | "configure-commissions"
  | "configure-attendance"
  | "configure-birthdays"
  | "set-agent-quotas"
  | "export-reports"
  | "manage-own-listings"
  | "manage-blogs";

export type PermissionDef = {
  key: PermissionKey;
  label: string;
  description: string;
  adminLocked?: boolean;
};

export type RolePermissionMatrix = Record<PortalRole, PermissionKey[]>;

export type ActivityLogEntry = {
  id: string;
  user: string;
  email: string;
  initials: string;
  action: string;
  module: string;
  timestamp: string;
  ip: string;
};

export type QuotaPeriodId = "weekly" | "monthly" | "quarterly";

export type AttendanceType = "meeting" | "pks";
export type AttendanceSessionStatus = "attended" | "missed" | "upcoming";

export type AttendanceSession = {
  id: string;
  type: AttendanceType;
  title: string;
  date: string;
  status: AttendanceSessionStatus;
};

export type RewardTier = { points: number; label: string };

export type AttendanceConfig = {
  period: "monthly" | "quarterly" | "yearly";
  periodLabel: string;
  periodStart: string;
  asOf: string;
  pointsPerMeeting: number;
  pointsPerPks: number;
  eligibilityMinRate: number;
  rewardTiers: RewardTier[];
};

export type LeaderboardTeamId = "vanguard" | "skyline" | "horizon";

export type LeaderboardTeam = {
  id: LeaderboardTeamId;
  name: string;
  tone: "navy" | "gold" | "blue";
  dot: string;
  border: string;
};

export type LeaderboardAgent = {
  id: string;
  name: string;
  photo: string;
  region: string;
  teamId: LeaderboardTeamId;
  units: number;
  leads: number;
  isYou?: boolean;
  quota: Record<QuotaPeriodId, number>;
  achieved: Record<QuotaPeriodId, number>;
};

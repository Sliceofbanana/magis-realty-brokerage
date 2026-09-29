// One-off script: nulls out passwordHash for every user.
// Purpose: the seed data (prisma/seed.ts) gives every account the same
// publicly-known demo password. This closes that login backdoor on
// production without touching any public-facing content.
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

(async () => {
  const result = await prisma.user.updateMany({ data: { passwordHash: null } });
  console.log("Invalidated passwordHash for", result.count, "users");
  await prisma.$disconnect();
})();

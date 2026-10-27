import { deleteTestAccounts } from "./helpers/accounts";
import { db } from "./helpers/db";

export default async function globalTeardown() {
  // Sign-ins and other events the suite's accounts caused. History outlives a deleted
  // account by design (userLabel is a snapshot), so it has to be cleared explicitly.
  await db.activityLogEntry.deleteMany({ where: { userLabel: { in: ["E2E Admin", "E2E Agent"] } } });
  await deleteTestAccounts();
  await db.$disconnect();
}

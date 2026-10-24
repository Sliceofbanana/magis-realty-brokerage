import { createTestAccounts } from "./helpers/accounts";
import { db } from "./helpers/db";

export default async function globalSetup() {
  await createTestAccounts();
  await db.$disconnect();
}

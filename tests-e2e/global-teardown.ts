import { deleteTestAccounts } from "./helpers/accounts";
import { db } from "./helpers/db";

export default async function globalTeardown() {
  await deleteTestAccounts();
  await db.$disconnect();
}

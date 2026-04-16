import { prisma } from "@/server/db/client";

export async function resetDatabase() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "settlement_results",
      "expenses",
      "period_participants",
      "periods",
      "invites",
      "pair_members",
      "pairs",
      "auth_accounts",
      "users"
    RESTART IDENTITY CASCADE
  `);
}

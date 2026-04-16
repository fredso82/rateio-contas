-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('credentials', 'google');

-- CreateEnum
CREATE TYPE "PairStatus" AS ENUM ('active', 'archived');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('pending', 'accepted', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "PeriodStatus" AS ENUM ('open', 'partially_closed', 'closed');

-- CreateEnum
CREATE TYPE "PeriodParticipantStatus" AS ENUM ('open', 'closed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pixKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pairs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "PairStatus" NOT NULL DEFAULT 'active',
    "archivedAt" TIMESTAMP(3),
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pair_members" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pair_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedByUserId" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periods" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "label" TEXT,
    "status" "PeriodStatus" NOT NULL DEFAULT 'open',
    "openedByUserId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "reopenedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "period_participants" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PeriodParticipantStatus" NOT NULL DEFAULT 'open',
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "period_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "paidByUserId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "occurredOn" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "expenses_amountCents_check" CHECK ("amountCents" > 0)
);

-- CreateTable
CREATE TABLE "settlement_results" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "totalAmountCents" INTEGER NOT NULL,
    "sharePerPersonCents" INTEGER NOT NULL,
    "payerUserId" TEXT NOT NULL,
    "receiverUserId" TEXT NOT NULL,
    "transferAmountCents" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settlement_results_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "settlement_results_totalAmountCents_check" CHECK ("totalAmountCents" >= 0),
    CONSTRAINT "settlement_results_sharePerPersonCents_check" CHECK ("sharePerPersonCents" >= 0),
    CONSTRAINT "settlement_results_transferAmountCents_check" CHECK ("transferAmountCents" >= 0),
    CONSTRAINT "settlement_results_payer_receiver_check" CHECK ("payerUserId" <> "receiverUserId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_provider_providerAccountId_key" ON "auth_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "auth_accounts_userId_idx" ON "auth_accounts"("userId");

-- CreateIndex
CREATE INDEX "pairs_createdByUserId_idx" ON "pairs"("createdByUserId");

-- CreateIndex
CREATE INDEX "pairs_status_idx" ON "pairs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "pair_members_pairId_userId_key" ON "pair_members"("pairId", "userId");

-- CreateIndex
CREATE INDEX "pair_members_pairId_idx" ON "pair_members"("pairId");

-- CreateIndex
CREATE INDEX "pair_members_userId_idx" ON "pair_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_key" ON "invites"("token");

-- CreateIndex
CREATE INDEX "invites_pairId_idx" ON "invites"("pairId");

-- CreateIndex
CREATE INDEX "invites_createdByUserId_idx" ON "invites"("createdByUserId");

-- CreateIndex
CREATE INDEX "invites_acceptedByUserId_idx" ON "invites"("acceptedByUserId");

-- CreateIndex
CREATE INDEX "invites_status_expiresAt_idx" ON "invites"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "periods_pairId_idx" ON "periods"("pairId");

-- CreateIndex
CREATE INDEX "periods_openedByUserId_idx" ON "periods"("openedByUserId");

-- CreateIndex
CREATE INDEX "periods_pairId_status_idx" ON "periods"("pairId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "periods_pairId_active_unique_idx"
ON "periods"("pairId")
WHERE "status" IN ('open', 'partially_closed');

-- CreateIndex
CREATE UNIQUE INDEX "period_participants_periodId_userId_key" ON "period_participants"("periodId", "userId");

-- CreateIndex
CREATE INDEX "period_participants_periodId_idx" ON "period_participants"("periodId");

-- CreateIndex
CREATE INDEX "period_participants_userId_idx" ON "period_participants"("userId");

-- CreateIndex
CREATE INDEX "period_participants_periodId_status_idx" ON "period_participants"("periodId", "status");

-- CreateIndex
CREATE INDEX "expenses_periodId_idx" ON "expenses"("periodId");

-- CreateIndex
CREATE INDEX "expenses_paidByUserId_idx" ON "expenses"("paidByUserId");

-- CreateIndex
CREATE INDEX "expenses_periodId_occurredOn_idx" ON "expenses"("periodId", "occurredOn");

-- CreateIndex
CREATE UNIQUE INDEX "settlement_results_periodId_key" ON "settlement_results"("periodId");

-- CreateIndex
CREATE INDEX "settlement_results_payerUserId_idx" ON "settlement_results"("payerUserId");

-- CreateIndex
CREATE INDEX "settlement_results_receiverUserId_idx" ON "settlement_results"("receiverUserId");

-- AddForeignKey
ALTER TABLE "auth_accounts"
ADD CONSTRAINT "auth_accounts_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pairs"
ADD CONSTRAINT "pairs_createdByUserId_fkey"
FOREIGN KEY ("createdByUserId") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pair_members"
ADD CONSTRAINT "pair_members_pairId_fkey"
FOREIGN KEY ("pairId") REFERENCES "pairs"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pair_members"
ADD CONSTRAINT "pair_members_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites"
ADD CONSTRAINT "invites_pairId_fkey"
FOREIGN KEY ("pairId") REFERENCES "pairs"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites"
ADD CONSTRAINT "invites_createdByUserId_fkey"
FOREIGN KEY ("createdByUserId") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites"
ADD CONSTRAINT "invites_acceptedByUserId_fkey"
FOREIGN KEY ("acceptedByUserId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periods"
ADD CONSTRAINT "periods_pairId_fkey"
FOREIGN KEY ("pairId") REFERENCES "pairs"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periods"
ADD CONSTRAINT "periods_openedByUserId_fkey"
FOREIGN KEY ("openedByUserId") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "period_participants"
ADD CONSTRAINT "period_participants_periodId_fkey"
FOREIGN KEY ("periodId") REFERENCES "periods"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "period_participants"
ADD CONSTRAINT "period_participants_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses"
ADD CONSTRAINT "expenses_periodId_fkey"
FOREIGN KEY ("periodId") REFERENCES "periods"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses"
ADD CONSTRAINT "expenses_paidByUserId_fkey"
FOREIGN KEY ("paidByUserId") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_results"
ADD CONSTRAINT "settlement_results_periodId_fkey"
FOREIGN KEY ("periodId") REFERENCES "periods"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_results"
ADD CONSTRAINT "settlement_results_payerUserId_fkey"
FOREIGN KEY ("payerUserId") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_results"
ADD CONSTRAINT "settlement_results_receiverUserId_fkey"
FOREIGN KEY ("receiverUserId") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateFunction
CREATE OR REPLACE FUNCTION enforce_pair_member_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM "pair_members"
        WHERE "pairId" = NEW."pairId"
          AND "id" <> COALESCE(NEW."id", '')
    ) >= 2 THEN
        RAISE EXCEPTION 'A pair cannot have more than 2 members';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CreateTrigger
CREATE TRIGGER pair_members_limit_trigger
BEFORE INSERT OR UPDATE OF "pairId" ON "pair_members"
FOR EACH ROW
EXECUTE FUNCTION enforce_pair_member_limit();

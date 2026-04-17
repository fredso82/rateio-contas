-- AlterTable
ALTER TABLE "users"
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

-- Backfill
UPDATE "users"
SET "emailVerifiedAt" = CURRENT_TIMESTAMP
WHERE EXISTS (
  SELECT 1
  FROM "auth_accounts"
  WHERE "auth_accounts"."userId" = "users"."id"
    AND "auth_accounts"."provider" = 'google'
)
AND "emailVerifiedAt" IS NULL;

-- AlterTable
ALTER TABLE "invites"
ADD COLUMN "tokenHash" TEXT,
ADD COLUMN "tokenCiphertext" TEXT,
ALTER COLUMN "token" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "invites_tokenHash_key" ON "invites"("tokenHash");

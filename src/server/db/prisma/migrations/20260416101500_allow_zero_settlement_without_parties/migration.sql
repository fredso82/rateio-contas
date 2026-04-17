-- AlterTable
ALTER TABLE "settlement_results"
ALTER COLUMN "payerUserId" DROP NOT NULL,
ALTER COLUMN "receiverUserId" DROP NOT NULL;

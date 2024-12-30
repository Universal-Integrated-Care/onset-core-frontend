-- AlterTable
ALTER TABLE "practitioner_availability" ALTER COLUMN "is_available" DROP NOT NULL,
ALTER COLUMN "is_blocked" DROP NOT NULL;

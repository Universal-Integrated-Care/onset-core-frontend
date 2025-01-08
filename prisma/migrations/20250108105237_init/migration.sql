-- DropIndex
DROP INDEX "patients_medicare_number_key";

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "is_primary_contact" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "last_name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

/*
  Warnings:

  - The values [SCHEDULED,CANCELLED,PENDING] on the enum `appointmentstatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "appointmentstatus_new" AS ENUM ('scheduled', 'cancelled', 'pending');
ALTER TABLE "patient_appointments" ALTER COLUMN "status" TYPE "appointmentstatus_new" USING ("status"::text::"appointmentstatus_new");
ALTER TYPE "appointmentstatus" RENAME TO "appointmentstatus_old";
ALTER TYPE "appointmentstatus_new" RENAME TO "appointmentstatus";
DROP TYPE "appointmentstatus_old";
COMMIT;
